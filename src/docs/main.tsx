import { render } from "preact";

import { StrudelMini, StrudelPattern } from "../lib/strudelmini";

import { fastcat } from "@strudel/core";
import { mini } from "@strudel/mini";

window.addEventListener("load", () => {
  const parent = document.getElementById("output");

  if (parent) {
    render(
      <>
        <div style="display: flex; flex-direction: column;">
          <div style="margin-right: 20px;">
            <StrudelMini miniPattern="a b c d" />
            <StrudelMini miniPattern="a [b c] d" />
            <StrudelMini miniPattern="a(3, 8)" />
            <StrudelMini miniPattern="a b c, a b c d" />
            <StrudelMini miniPattern="[a b c]*3" highlight={[0.25, 0.75]} />
          </div>
          <div>
            <StrudelMini miniPattern="[a?]*8" span={[0, 2]} />
            <StrudelMini miniPattern="a <b c>" span={[0, 2]} />
            <StrudelMini miniPattern="a/2" span={[0, 2]} />
            <StrudelMini miniPattern="{a b c, a b c d}" span={[0, 2]} />
          </div>
          <div>
            <StrudelPattern
              pattern={fastcat("fast(1)", "fast(2)", "fast(3)")}
            />
            <StrudelPattern
              title="fast(1)"
              pattern={mini("a b c d").fast(1)}
              highlight={[0, [1, 3]]}
            />

            <StrudelPattern
              title="fast(2)"
              pattern={mini("a b c d").fast(2)}
              highlight={[
                [1, 3],
                [2, 3],
              ]}
            />
            <StrudelPattern
              title="fast(3)"
              pattern={mini("a b c d").fast(3)}
              highlight={[[2, 3], 1]}
            />
            <StrudelPattern
              title={'"a b c d".fast("1 2 3")'}
              pattern={mini("a b c d").fast(mini("1 2 3"))}
            />
          </div>
        </div>
      </>,
      parent
    );
  }
});
