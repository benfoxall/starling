import "@fontsource/roboto-mono";
import "./main.css";

const pages = {
  track: () => import("./pages/track"),
  depth: () => import("./pages/depth"),
  '3dview': () => import("./pages/3d"),
  depth3d: () => import("./pages/depth3d"),
};

const params = new URLSearchParams(location.search);
const loader = pages[params.get("page")];

if (loader) {
  loader();

  document.querySelector("#menu").open = false;
}

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}
