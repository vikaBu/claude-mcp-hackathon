import cors from "cors";
import express from "express";
import { widgetsDevServer } from "skybridge/server";
import { mcp } from "./middleware.js";
import server from "./server.js";

const app = express();

// Trust the proxy (cloudflared/Alpic) so req.protocol returns https
app.set("trust proxy", 1);

app.use(express.json());

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv !== "production") {
  // Widget preview: serve HTML shell when navigating to /assets/<name>.js in a browser
  // Must be before widgetsDevServer so browser navigations get HTML, not raw JS
  app.get("/assets/:widgetName.js", (req, res, next) => {
    if (!req.headers.accept?.includes("text/html")) return next();
    const widgetName = req.params.widgetName;
    const origin = `${req.protocol}://${req.get("host")}`;
    res.send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${widgetName}</title><style>body{margin:0;background:#18181b;}</style></head>
<body>
<script type="module">window.skybridge = { hostType: "mcp-app", serverUrl: "${origin}" };</script>
<script type="module">
  import { injectIntoGlobalHook } from "${origin}/assets/@react-refresh";
  injectIntoGlobalHook(window); window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  window.__vite_plugin_react_preamble_installed__ = true;
</script>
<script type="module" src="${origin}/@vite/client"></script>
<div id="root"></div>
<script type="module">import("${origin}/src/widgets/${widgetName}");</script>
</body>
</html>`);
  });

  const { devtoolsStaticServer } = await import("@skybridge/devtools");
  app.use(await devtoolsStaticServer());
  app.use(await widgetsDevServer());
}

if (nodeEnv === "production") {
  app.use("/assets", cors());
  app.use("/assets", express.static("dist/assets"));
}

app.use(cors());

app.use(mcp(server));

const port = Number(process.env.__PORT ?? 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
