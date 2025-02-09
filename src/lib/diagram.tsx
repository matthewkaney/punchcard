import { createContext, VNode } from "preact";
import { useContext } from "preact/hooks";

import { Span, Hap } from "./types";

interface ScaleSpec {
  span: Span;
  steps?: number;
  canvas: { horiz: Span; vert: Span };
}

const defaultScale = {
  span: { begin: 0, end: 1 },
  canvas: { horiz: { begin: 20, end: 480 }, vert: { begin: 20, end: 80 } },
};

const Scale = createContext<ScaleSpec>(defaultScale);

export interface PatternDiagram {
  dom: HTMLDivElement;
  setPattern: (pat: any) => void;
}

interface DiagramProps {
  haps: Hap<string | number>[];
  span: Span;
  steps?: number;
}

export function Diagram({ haps, span, steps }: DiagramProps) {
  console.log(steps);
  return (
    <Scale.Provider value={{ ...defaultScale, span, steps }}>
      <svg width="500" height="120">
        <Background />
        {haps.map(({ whole, part, value }) => (
          <Hap
            whole={whole}
            part={part}
            label={typeof value === "string" ? value : value.toString()}
          />
        ))}
        <Axis />
      </svg>
    </Scale.Provider>
  );
}

export function Background() {
  const {
    canvas: { vert, horiz },
  } = useContext(Scale);

  return (
    <rect
      x={horiz.begin}
      y={vert.begin}
      width={length(horiz)}
      height={length(vert)}
      fill="#ffffff22"
      stroke="none"
    ></rect>
  );
}

export function Axis() {
  const {
    span,
    steps: providedSteps,
    canvas: { vert, horiz },
  } = useContext(Scale);

  const ticks: VNode[] = [];

  const steps = providedSteps ?? 1;
  const firstStep = Math.ceil(span.begin * steps) / steps;

  for (let i = firstStep; i <= span.end; i += 1 / steps) {
    let x = map(i, span, contract(3, horiz));

    if (i === Math.trunc(i)) {
      ticks.push(
        <>
          <line
            x1={x}
            x2={x}
            y1={vert.end + 3}
            y2={vert.end + 20}
            stroke="#FFF"
            stroke-width={3}
          />
          <text
            x={x}
            y={vert.end + 23}
            fill="white"
            text-anchor="middle"
            dominant-baseline="hanging"
          >
            {i}
          </text>
        </>
      );
    } else {
      ticks.push(
        <line
          x1={x}
          x2={x}
          y1={vert.end + 3}
          y2={vert.end + 17}
          stroke="#FFF"
          stroke-width={2}
        />
      );
    }
  }

  return <>{...ticks}</>;
}

interface HapProps {
  whole?: Span;
  part: Span;
  label: string;
}

export function Hap({ whole, part, label }: HapProps) {
  const {
    span,
    canvas: { horiz, vert },
  } = useContext(Scale);
  const { begin, end } = part;

  const x1 = map(begin, span, horiz);
  const x2 = map(end, span, horiz);

  const { begin: y1, end: y2 } = vert;

  let hasOnset = begin === whole?.begin;
  let hasOffset = end === whole?.end;

  return (
    <>
      <rect
        x={x1}
        y={y1}
        width={x2 - x1}
        height={length(vert)}
        fill={hasOnset ? "#ffffff33" : "none"}
        stroke="none"
      ></rect>
      {hasOnset && (
        <line
          x1={x1 + 1.5}
          y1={y1}
          x2={x1 + 1.5}
          y2={y2}
          stroke="#fff"
          stroke-width="3"
        ></line>
      )}
      <text
        x={x1 + (x2 - x1) * 0.5}
        y={vert.begin + length(vert) * 0.5}
        fill="white"
        text-anchor="middle"
      >
        {label}
      </text>
    </>
  );
}

function length({ begin, end }: Span) {
  return end - begin;
}

function contract(amount: number, { begin, end }: Span): Span {
  return { begin: begin + amount / 2, end: end - amount / 2 };
}

function map(value: number, span1: Span, span2: Span) {
  return ((value - span1.begin) / length(span1)) * length(span2) + span2.begin;
}
