import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import adapter from "@sveltejs/adapter-static";
import autoprefixer from "autoprefixer";
import { readFileSync } from "fs";
import preprocess from "svelte-preprocess";
import { fileURLToPath } from "url";

const file = fileURLToPath(new URL("package.json", import.meta.url));
const json = readFileSync(file, "utf8");
const { version } = JSON.parse(json);

const filesPath = (path) => `src/frontend/${path}`;

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: {
        plugins: [autoprefixer],
      },
    }),
    vitePreprocess({}),
  ],
  kit: {
    adapter: adapter({
      fallback: "index.html",
      precompress: false,
    }),
    files: {
      assets: filesPath("static"),
      lib: filesPath("src/lib"),
      hooks: {
        server: filesPath("src/hooks/hooks.server.ts"),
        client: filesPath("src/hooks/hooks.client.ts"),
      },
      params: filesPath("src/params"),
      routes: filesPath("src/routes"),
      appTemplate: filesPath("src/app.html"),
      errorTemplate: filesPath("src/error.html"),
    },
  },
  serviceWorker: {
    register: false,
  },
  version: {
    name: version,
  },
};
export default config;
