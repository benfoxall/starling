import "@fontsource/roboto-mono";
import "./main.css";
import { createRoot } from "react-dom/client";
import { App } from "./App";

if (DEV) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload()
  );
}

const root = createRoot(document.getElementById("app"));

root.render(<App />);
