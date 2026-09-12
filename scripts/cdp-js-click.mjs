// Click a button by text via el.click(), then report any dialog/URL change.
// Usage: node cdp-js-click.mjs <urlFilter> <buttonText>
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

  const clickExpr = `(()=>{
    const els=[...document.querySelectorAll("button,[role=button],a")].filter(x=>x.textContent.includes(${JSON.stringify(TEXT)}));
    if(!els.length) return "not-found";
    els[0].click();
    return "js-clicked:"+els[0].tagName;
  })()`;
  const r1 = await send("Runtime.evaluate", { expression: clickExpr, returnByValue: true });
  console.log(r1.result.value);
  if (String(r1.result.value).startsWith("not-found")) process.exit(1);

  for (const wait of [3000, 6000]) {
    await new Promise(r => setTimeout(r, wait === 3000 ? 3000 : 3000));
    const d = await send("Runtime.evaluate", {
      expression: `JSON.stringify({url:location.href.slice(0,150),overlays:[...document.querySelectorAll("mat-dialog-container,[role=dialog],.cdk-overlay-container *[role=dialog]")].length,bodyHasWizard:/Add site|添加网站|Enter your site/i.test(document.body.innerText),bodyTail:document.body.innerText.slice(600,1000)})`,
      returnByValue: true,
    });
    console.log("check:", d.result.value);
    const parsed = JSON.parse(d.result.value);
    if (parsed.overlays > 0 || parsed.bodyHasWizard) break;
  }
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
