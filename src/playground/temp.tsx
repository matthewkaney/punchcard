import { render } from "solid-js/web";

// import "@strudel/core";
// import { mini } from "@strudel/mini";

import { StrudelMini } from "../lib/strudelmini";

window.addEventListener("load", () => {
  const output = document.getElementById("output");
  if (output) {
    render(() => <StrudelMini miniPattern="a b c d" />, output);
  }
});
