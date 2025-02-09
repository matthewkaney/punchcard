import { render } from "preact";

import { StrudelMini } from "../lib/strudelmini";

window.addEventListener("load", () => {
  const parent = document.getElementById("output");

  if (parent) {
    render(
      <>
        <StrudelMini miniPattern="a!3 b" span={[0, 2]} />
      </>,
      parent
    );
  }
});
