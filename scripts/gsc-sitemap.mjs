// Submit sitemap in GSC: find input, focus, type, click SUBMIT
const DEBUG_PORT = 9222;
async function main() {
  const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const page = list.filter(t => t.type === "page" && t.url.includes("search.google.com")).pop();
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

  const { root } = await send("DOM.getDocument", { depth: -1, pierce: true });
  let input = null, submit = null;
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const val = (n) => (n.children || []).map(c => c.nodeType === 3 ? (c.nodeValue || "") : "").join("");
  const walk = (n) => {
    if (n.nodeType === 1) {
      const a = n.attributes || [];
      const attrs = {};
      for (let i = 0; i < a.length; i += 2) attrs[a[i]] = a[i + 1];
      if (n.nodeName === "INPUT" && /sitemap/i.test(attrs["placeholder"] || attrs["aria-label"] || "")) input = n;
      if ((n.nodeName === "BUTTON" || n.nodeName === "A") && norm(attrs["aria-label"] || val(n)) === "submit") submit = n;
    }
    for (const c of n.children || []) walk(c);
    for (const s of n.shadowRoots || []) walk(s);
    if (n.contentDocument) walk(n.contentDocument);
  };
  walk(root);
  if (!input) throw new Error("sitemap input not found");
  console.log("input found, clicking into it...");
  const ibox = await send("DOM.getBoxModel", { nodeId: input.nodeId });
  const iq = ibox.model.content;
  const ix = (iq[0] + iq[2] + iq[4] + iq[6]) / 4, iy = (iq[1] + iq[3] + iq[5] + iq[7]) / 4;
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: ix, y: iy });
  await new Promise(r => setTimeout(r, 150));
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: ix, y: iy, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 120));
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: ix, y: iy, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 400));
  await send("Input.insertText", { text: "sitemap.xml" });
  await new Promise(r => setTimeout(r, 500));
  console.log(`typed sitemap.xml (input center ${Math.round(ix)},${Math.round(iy)})`);

  if (submit) {
    const box = await send("DOM.getBoxModel", { nodeId: submit.nodeId });
    const q = box.model.content;
    const cx = (q[0] + q[2] + q[4] + q[6]) / 4, cy = (q[1] + q[3] + q[5] + q[7]) / 4;
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cx, y: cy });
    await new Promise(r => setTimeout(r, 150));
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cx, y: cy, button: "left", clickCount: 1 });
    await new Promise(r => setTimeout(r, 120));
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cx, y: cy, button: "left", clickCount: 1 });
    console.log(`SUBMIT clicked at (${Math.round(cx)},${Math.round(cy)})`);
  } else {
    console.log("SUBMIT button not found — will click by position");
  }
  ws.close();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
