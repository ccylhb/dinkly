// v3: locate dialog-scoped input -> el.focus() -> insertText -> Save
const DEBUG_PORT = 9222;
const URL_TO_ADD = "https://dinkly.pages.dev/";

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const pages = list.filter(t => t.type === "page" && t.url.includes("adsense.google.com"));
  const page = pages[pages.length - 1];
  if (!page) throw new Error("no adsense tab");
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

  const clickAt = async (x, y) => {
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await new Promise(r => setTimeout(r, 150));
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await new Promise(r => setTimeout(r, 120));
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  };

  // dialog = element containing the Save button; input = <input> inside same dialog
  const r = await send("Runtime.evaluate", { expression: `(() => {
    const saveBtn = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim().toLowerCase() === 'save');
    if (!saveBtn) return { err: 'no save button' };
    let dlg = saveBtn.closest('[role="dialog"]') || saveBtn.closest('mat-dialog-container') || saveBtn.parentElement;
    for (let i = 0; i < 6 && dlg && !dlg.querySelector('input'); i++) dlg = dlg.parentElement;
    const inp = dlg ? dlg.querySelector('input') : null;
    if (!inp) return { err: 'no input in dialog' };
    inp.focus();
    const r2 = inp.getBoundingClientRect();
    return { focused: document.activeElement === inp, x: Math.round(r2.x + r2.width/2), y: Math.round(r2.y + r2.height/2),
      saveX: Math.round((saveBtn.getBoundingClientRect().x + saveBtn.getBoundingClientRect().width/2)),
      saveY: Math.round((saveBtn.getBoundingClientRect().y + saveBtn.getBoundingClientRect().height/2)) };
  })()`, returnByValue: true });
  const v = r.result.value;
  if (v.err) throw new Error(v.err);
  console.log("focused:", v.focused, "input center:", v.x, v.y, "save:", v.saveX, v.saveY);

  // trusted click on input too (Angular sometimes needs it), then insertText
  await clickAt(v.x, v.y);
  await new Promise(r2 => setTimeout(r2, 300));
  await send("Input.insertText", { text: URL_TO_ADD });
  await new Promise(r2 => setTimeout(r2, 600));

  const chk = await send("Runtime.evaluate", { expression: `(() => {
    const saveBtn = [...document.querySelectorAll('button')].find(b => b.offsetParent && b.textContent.trim().toLowerCase() === 'save');
    let dlg = saveBtn.closest('[role="dialog"]') || saveBtn.closest('mat-dialog-container') || saveBtn.parentElement;
    for (let i = 0; i < 6 && dlg && !dlg.querySelector('input'); i++) dlg = dlg.parentElement;
    return dlg.querySelector('input').value;
  })()`, returnByValue: true });
  console.log("value now:", JSON.stringify(chk.result.value));

  await clickAt(v.saveX, v.saveY);
  console.log("Save clicked");
  await new Promise(r2 => setTimeout(r2, 3000));

  const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 });
  (await import("node:fs")).writeFileSync(new URL("../_state.jpg", import.meta.url), Buffer.from(s.data, "base64"));
  console.log("screenshot saved");
  ws.close();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
