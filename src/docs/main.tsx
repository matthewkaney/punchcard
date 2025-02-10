import { render } from "preact";

import { StrudelMini } from "../lib/strudelmini";

window.addEventListener("load", () => {
  const parent = document.getElementById("output");

  if (parent) {
    render(
      <>
        <div style="display: flex;">
          <div style="margin-right: 20px;">
            <StrudelMini miniPattern="a b c d" />
            <StrudelMini miniPattern="a [b c] d" />
            <StrudelMini miniPattern="a(3, 8)" />
            <StrudelMini miniPattern="[a b c, a b c d]" />
          </div>
          <div>
            <StrudelMini miniPattern="[a?]*8" span={[0, 2]} />
            <StrudelMini miniPattern="a <b c>" span={[0, 2]} />
            <StrudelMini miniPattern="a/2" span={[0, 2]} />
            <StrudelMini miniPattern="{a b c, a b c d}" span={[0, 2]} />
          </div>
        </div>
      </>,
      parent
    );
  }
});
