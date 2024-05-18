import '@fontsource/roboto-mono';
import './main.css';

console.log("Hello mainss!")


if (DEV) {
    new EventSource("/esbuild").addEventListener("change", () =>
        location.reload()
    );
}
