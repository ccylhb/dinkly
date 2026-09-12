// Reload, wait, verify clean, then trusted-click target button and report dialog state.
// Usage: node cdp-clean-click.mjs <urlFilter> <navUrl> <buttonText>
const DEBUG_PORT = 9222;
const [, , URL_FILTER = "adsense.google.com", NAV_URL, TEXT = "New site"] = process.argv;

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
  await send("Page.enable");
  await send("Page.navigate", { url: NAV_URL });
  await new Promise(r => setTimeout(r, 12000));

  const check = async label => {
    const d = await send("Runtime.evaluate", {
      expression: `(()=>{const c=document.querySelector(".acx-overlay-container");const modals=c?[...c.children].filter(p=>p.className.includes("modal")&&p.className.includes("visible")):[];return JSON.stringify({modals:modals.length,btn:!![...document.querySelectorAll("button")].find(x=>x.textContent.includes(${JSON.stringify(TEXT)}))})})()`,
      returnByValue: true,
    });
    console.log(label, d.result.value);
    return JSON.parse(d.result.value);
  };

  let s = await check("after load:");
  if (s.modals > 0) {
    console.log("modal still present, reloading again...");
    await send("Page.navigate", { url: NAV_URL });
    await new Promise(r => setTimeout(r, 10000));
    s = await check("after reload:");
  }
  if (!s.btn) { console.log("button not found"); process.exit(1); }

  const m = await send("Runtime.evaluate", {
    expression: `(()=>{const e=[...document.querySelectorAll("button")].find(x=>x.textContent.includes(${JSON.stringify(TEXT)}));const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`,
    returnByValue: true,
  });
  const { x, y } = m.result.value;
  console.log("clicking at", x.toFixed(0), y.toFixed(0));
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await new Promise(r => setTimeout(r, 150));
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 120));
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  await new Promise(r => setTimeout(r, 6000));

  const d = await send("Runtime.evaluate", {
    expression: `JSON.stringify({url:location.href.slice(0,150),modals:(()=>{const c=document.querySelector(".acx-overlay-container");return c?[...c.children].filter(p=>p.className.includes("modal")).map(p=>p.innerText.slice(0,400)):[]})()})`,
    returnByValue: true,
  });
  console.log("result:", d.result.value);
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
