import { Suspense, lazy } from "react";

const Track = lazy(() => import("./pages/Track"));

const PAGES = {
  track: lazy(() => import("./pages/Track")),
};

export const App = () => {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");
  const Current = PAGES[page];

  return (
    <>
      <details open={page === null}>
        <summary>Starling</summary>
        <nav>
          {Object.keys(PAGES).map((page) => (
            <a key={page} href={`?page=${page}`}>
              {page}
            </a>
          ))}
        </nav>
      </details>

      <Suspense fallback="→">{Current ? <Current /> : ""}</Suspense>
    </>
  );
};
