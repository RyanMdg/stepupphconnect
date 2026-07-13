import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <App /> */}
    <div className=" flex justify-center text-center flex-col items-center h-screen">
      <img
        src="../src/assets/logo.jpeg"
        alt="logo-img"
        className=" h-48 pb-10"
      />
      <p className=" uppercase text-2xl">
        🚧 This Website Is Currently Under Construction
        <br />
        <span className=" text-sm text-gray-400">
          We're working hard to bring you a better experience. Please check back
          soon.
        </span>
      </p>
    </div>
  </StrictMode>,
);
