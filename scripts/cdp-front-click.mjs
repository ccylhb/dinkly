// bringToFront + trusted mouse click on button found by text.
// Usage: node cdp-front-click.mjs <urlFilter> <buttonText>
const DEBUG_PORT = 9222;
const [, , URL_FILTER = "adsense.google.com", TEXT = "New site"] = process.argv;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`)).json();
  const page = list.filter(t => t.type === "page" && t.url.includes(URL_FILTER)).pop();
  if (!page) throw new Error(`no tab matching ${URL_FILTER}`);
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
  await send("Page.bringToFront");
  await new Promise(r => setTimeout(r, 1000));

  const m = await send("Runtime.evaluate", {
    expression: `(()=>{const els=[...document.querySelectorAll("button,[role=button]")].filter(x=>x.textContent.includes(${JSON.stringify(TEXT)}));if(!els.length)return null;const e=els[0];const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    returnByValue: true,
  });
  if (!m.result.value) { console.log("button not found"); process.exit(1); }
  const { x, y } = m.result.value;
  console.log("front+click at", x.toFixed(0), y.toFixed(0));
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await new Promise(r => setTimeout(r, 200));
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 150));
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 6000));
  const d = await send("Runtime.evaluate", {
    expression: `JSON.stringify({url:location.href.slice(0,150),dialogs:document.querySelectorAll("mat-dialog-container,[role=dialog]").length,text:document.body.innerText.length})`,
    returnByValue: true,
  });
  console.log(d.result.value);
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
