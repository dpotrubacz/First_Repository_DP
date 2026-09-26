// Builds a single-file version of the app for publishing as a claude.ai artifact.
// Output: artifact/dist/spendwise.html
//
// The artifact viewer differs from a normal host, so this build swaps in small shims:
// - next/link and next/navigation use "#token" hash routes (only bare hashes survive in artifact links)
// - CSV export opens a copy dialog, because the viewer blocks file downloads
// - React and ReactDOM load from cdnjs instead of being bundled
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const src = path.join(root, "src");
const dist = path.join(here, "dist");
const require = createRequire(import.meta.url);
const shim = (file) => path.join(here, "shims", file);

const aliases = {
  react: shim("react.js"),
  "react/jsx-runtime": shim("jsx-runtime.js"),
  "react-dom/client": shim("react-dom-client.js"),
  "next/link": shim("next-link.tsx"),
  "next/navigation": shim("next-navigation.ts"),
  "@/lib/csv": shim("csv.ts"),
};

const resolvePlugin = {
  name: "spendwise-artifact",
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (aliases[args.path]) return { path: aliases[args.path] };
      if (args.path.startsWith("@/")) {
        return build.resolve(`./${args.path.slice(2)}`, { resolveDir: src, kind: args.kind });
      }
      return undefined;
    });
  },
};

mkdirSync(dist, { recursive: true });

const bundle = await esbuild.build({
  entryPoints: [path.join(here, "entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2019",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  plugins: [resolvePlugin],
  logLevel: "warning",
});
const js = bundle.outputFiles[0].text.replaceAll("</script", "<\\/script");

const cssFile = path.join(dist, "app.css");
execFileSync(
  process.execPath,
  [
    require.resolve("tailwindcss/lib/cli.js"),
    "-c", path.join(root, "tailwind.config.ts"),
    "-i", path.join(src, "app/globals.css"),
    "--content", `${src}/**/*.{ts,tsx},${here}/**/*.{ts,tsx}`,
    "-o", cssFile,
    "--minify",
  ],
  { cwd: root, stdio: ["ignore", "ignore", "inherit"] },
);
const css = readFileSync(cssFile, "utf8");

// Load the same React version the app is built against.
const reactVersion = JSON.parse(readFileSync(require.resolve("react/package.json"), "utf8")).version;
const cdn = `https://cdnjs.cloudflare.com/ajax/libs`;

const html = `<title>Spendwise</title>
<meta name="description" content="Track, filter, and analyze your personal expenses.">
<style>${css}
/* Artifact frame adjustments: match the app's 16px base and keep the sticky header clear of phone system bars. */
body{font-size:16px;background:#f8fafc;color:#0f172a}
header.sticky{top:env(safe-area-inset-top,0px)}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important}}
</style>
<div id="root"></div>
<script src="${cdn}/react/${reactVersion}/umd/react.production.min.js"></script>
<script src="${cdn}/react-dom/${reactVersion}/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;

const out = path.join(dist, "spendwise.html");
writeFileSync(out, html);
console.log(`Built ${path.relative(root, out)} (${(html.length / 1024).toFixed(0)} KB, React ${reactVersion})`);
