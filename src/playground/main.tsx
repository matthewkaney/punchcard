import { render } from "preact";
import { useState, useEffect } from "preact/hooks";

import { Fraction } from "fraction.js";
import { StrudelPattern } from "../lib/strudelmini";

import * as Strudel from "@strudel/core";
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
    render(
      <>
        <Editor />
      </>,
      parent
    );
  }
});

function Editor() {
  const [expr, setExpr] = useState("");
  const [pattern, setPattern] = useState<any>(silence);

  const [begin, setBegin] = useState("0");
  const [end, setEnd] = useState("1");

  useEffect(() => {
    let aborted = false;

    evaluate(expr)
      .then(({ pattern }: any) => {
        if (isPattern(pattern)) {
          setPattern(pattern);
        }
      })
      .catch((e: any) => {
        console.log("Ignored error");
      });

    return () => {
      aborted = true;
    };
  }, [expr]);

  return (
    <>
      <div class="controls">
        <input
          style="flex: 1; font-family: monospace"
          value={expr}
          onInput={({ target }) => {
            if (
              target &&
              "value" in target &&
              typeof target.value === "string"
            ) {
              setExpr(target.value);
            }
          }}
        />{" "}
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
      <StrudelPattern pattern={pattern} span={[begin, end]} />
    </>
  );
}
