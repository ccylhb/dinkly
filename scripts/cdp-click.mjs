// One-session trusted click: discover -> boxmodel -> hover -> click, with retries
const DEBUG_PORT = 9222;
const TARGET_TEXT = process.argv[2] || "Verify your ownership";

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const siteFilter = process.argv[4] || "search.google.com";
  const pages = list.filter(t => t.type === "page" && t.url.includes(siteFilter));
  const page = pages[pages.length - 1];
  if (!page) throw new Error(`no tab matching ${siteFilter}`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
    }
  };
  await new Promise(r => ws.onopen = r);
  await send("DOM.enable");

  if (TARGET_TEXT === "SCREENSHOT") {
    const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
    (await import("node:fs")).writeFileSync(new URL("../_state.jpg", import.meta.url), Buffer.from(s.data, "base64"));
    console.log("screenshot saved");
    ws.close();
    return;
  }
  if (TARGET_TEXT === "CLICKAT") {
    const [fx, fy] = process.argv[3].split(",").map(Number);
    const vp = await send("Runtime.evaluate", { expression: "({w:innerWidth,h:innerHeight})", returnByValue: true });
    const x = Math.round(fx * vp.result.value.w), y = Math.round(fy * vp.result.value.h);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await new Promise(r => setTimeout(r, 150));
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await new Promise(r => setTimeout(r, 120));
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    console.log(`trusted click at (${x},${y})`);
    ws.close();
    return;
  }

  if (TARGET_TEXT === "SCREENSHOT") {
    const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
    (await import("node:fs")).writeFileSync(new URL("../_state.jpg", import.meta.url), Buffer.from(s.data, "base64"));
    console.log("screenshot saved");
    ws.close();
    return;
  }

  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const TARGET = norm(TARGET_TEXT);

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await send("DOM.getDocument", { depth: -1, pierce: true });
      const { root } = await send("DOM.getDocument", { depth: -1, pierce: true });
      let hit = null;
      const val = (n) => (n.children || []).map(c => c.nodeType === 3 ? (c.nodeValue || "") : "").join("");
      const walk = (n) => {
        if (hit) return;
        if (n.nodeType === 1) {
          const a = n.attributes || [];
          const attrs = {};
          for (let i = 0; i < a.length; i += 2) attrs[a[i]] = a[i + 1];
          if (norm(attrs["aria-label"]) === TARGET || norm(val(n)) === TARGET) { hit = n; return; }
        }
        for (const c of n.children || []) walk(c);
        for (const s of n.shadowRoots || []) walk(s);
        if (n.contentDocument) walk(n.contentDocument);
      };
      walk(root);
      if (!hit) throw new Error(`no match for "${TARGET_TEXT}"`);
      console.log(`attempt ${attempt}: nodeId=${hit.nodeId}`);
      const box = await send("DOM.getBoxModel", { nodeId: hit.nodeId });
      const q = box.model.content;
      const cx = (q[0] + q[2] + q[4] + q[6]) / 4;
      const cy = (q[1] + q[3] + q[5] + q[7]) / 4;
      const sc = await send("Runtime.evaluate", { expression: "({sx:scrollX,sy:scrollY})", returnByValue: true });
      const vx = Math.round(cx - sc.result.value.sx), vy = Math.round(cy - sc.result.value.sy);
      console.log(`clicking (${vx},${vy})`);
      await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: vx, y: vy });
      await new Promise(r => setTimeout(r, 200));
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: vx, y: vy, button: "left", clickCount: 1 });
      await new Promise(r => setTimeout(r, 150));
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: vx, y: vy, button: "left", clickCount: 1 });
      console.log(`trusted click sent on "${TARGET_TEXT}" at (${vx},${vy})`);
      ws.close();
      return;
    } catch (e) {
      console.log(`attempt ${attempt} failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 800));
    }
  }
  process.exit(1);
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
