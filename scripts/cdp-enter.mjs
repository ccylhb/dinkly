// Focus a button by text and press Enter (trusted keyboard event) via CDP.
// Usage: node cdp-enter.mjs <urlFilter> <buttonText>
const DEBUG_PORT = 9222;
const [, , URL_FILTER = "adsense.google.com", TEXT = "New site"] = process.argv;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const page = list.filter(t => t.type === "page" && t.url.includes(URL_FILTER)).pop();
  if (!page) throw new Error(`no tab matching ${URL_FILTER}`);
  console.log("tab:", page.url.slice(0, 90));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const i = ++id;
      pending.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  await new Promise(r => (ws.onopen = r));

  const focusExpr = `(()=>{
    const els=[...document.querySelectorAll("button,[role=button],a")].filter(x=>x.textContent.includes(${JSON.stringify(TEXT)}));
    if(!els.length) return "not-found";
    els[0].focus();
    return "focused:"+document.activeElement.tagName;
  })()`;
  const fr = await send("Runtime.evaluate", { expression: focusExpr, returnByValue: true });
  console.log("focus:", fr.result.value);
  if (fr.result.value === "not-found") process.exit(1);

  await new Promise(r => setTimeout(r, 300));
  for (const t of ["rawKeyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", {
      type: t,
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
      text: t === "rawKeyDown" ? "\r" : "",
    });
  }
  console.log("enter sent");
  await new Promise(r => setTimeout(r, 5000));

  const d = await send("Runtime.evaluate", {
    expression: `JSON.stringify({dialogs:[...document.querySelectorAll("mat-dialog-container,[role=dialog]")].map(d=>d.innerText.slice(0,400)),url:location.href.slice(0,140)})`,
    returnByValue: true,
  });
  console.log(d.result.value);
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
