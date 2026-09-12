// Capture console + exception messages while clicking a button.
// Usage: node cdp-console.mjs <urlFilter> <buttonText>
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
  const logs = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
      logs.push(`[${m.params.type}] ` + m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 200));
    }
    if (m.method === "Runtime.exceptionThrown") {
      logs.push("[exception] " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").slice(0, 300));
    }
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    }
  };
  await new Promise(r => (ws.onopen = r));
  await send("Runtime.enable");
  await send("Log.enable");

  const clickExpr = `(()=>{
    const els=[...document.querySelectorAll("button,[role=button]")].filter(x=>x.textContent.includes(${JSON.stringify(TEXT)}));
    if(!els.length) return "not-found";
    els[0].click();
    return "clicked";
  })()`;
  const r1 = await send("Runtime.evaluate", { expression: clickExpr, returnByValue: true });
  console.log("click:", r1.result.value);
  await new Promise(r => setTimeout(r, 5000));
  console.log("logs:", logs.length ? "\n" + logs.slice(0, 10).join("\n") : "(no errors)");
  const d = await send("Runtime.evaluate", {
    expression: `JSON.stringify({url:location.href.slice(0,150),dialogs:document.querySelectorAll("mat-dialog-container,[role=dialog]").length})`,
    returnByValue: true,
  });
  console.log(d.result.value);
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
