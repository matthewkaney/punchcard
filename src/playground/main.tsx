import { createSignal, createResource, createEffect, Show } from "solid-js";
import { render } from "solid-js/web";

import { Fraction } from "fraction.js";
import { StrudelPattern } from "../lib/strudelmini";

//@ts-ignore
import * as Strudel from "@strudel/core";
//@ts-ignore
import { silence, evaluate, setStringParser, isPattern } from "@strudel/core";
import { mini } from "@strudel/mini";

setStringParser(mini);

for (let [name, func] of Object.entries(Strudel)) {
  // @ts-ignore
  window[name] = func;
}

// @ts-ignore
window.mini = mini;

window.addEventListener("load", () => {
  const parent = document.getElementById("output");

  if (parent) {
    render(() => <Editor />, parent);
  }
});

function Editor() {
  const [expr, setExpr] = createSignal("");

  // const [begin, setBegin] = useState("0");
  // const [end, setEnd] = useState("1");

  const begin = 0;
  const end = 1;

  let [pattern] = createResource(
    expr,
    async (currentExpr) => {
      if (currentExpr.length === 0) {
        return silence;
      }

      let { pattern } = await evaluate(currentExpr);

      if (!isPattern(pattern)) {
        throw new Error("Expecting an expression that returns a pattern");
      }

      return pattern;
    },
    { initialValue: silence }
  );

  createEffect(() => {
    console.log(pattern.error);
  });

  return (
    <>
      <div class="controls">
        <input
          style="flex: 1; font-family: monospace"
          value={expr()}
          onInput={({ target }) => {
            if (
              target &&
              "value" in target &&
              typeof target.value === "string"
            ) {
              setExpr(target.value);
            }
          }}
        />
        {/*
        <input
          value={begin}
          onInput={({ target }) => {
            if (
              target &&
              "value" in target &&
              typeof target.value === "string"
            ) {
              setBegin(target.value);
            }
          }}
        />
        <input
          value={end}
          onInput={({ target }) => {
            if (
              target &&
              "value" in target &&
              typeof target.value === "string"
            ) {
              setEnd(target.value);
            }
          }}
        /> */}
      </div>
      <Show when={pattern.error}>
        {(error) => <div style="font-family: monospace">{error().message}</div>}
      </Show>
      <StrudelPattern pattern={pattern()} span={[begin, end]} />
    </>
  );
}
