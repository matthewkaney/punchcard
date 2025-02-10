import { createContext, VNode } from "preact";
import { useContext } from "preact/hooks";

import { Span, Hap } from "./types";
import { splitIntoRows } from "./haps";

interface ScaleSpec {
  span: Span;
  steps?: number;
  canvas: { horiz: Span; vert: Span };
}

const defaultScale = {
  span: { begin: 0, end: 1 },
  canvas: { horiz: { begin: 0, end: 490 }, vert: { begin: 0, end: 50 } },
};

const Scale = createContext<ScaleSpec>(defaultScale);

export interface PatternDiagram {
  dom: HTMLDivElement;
  setPattern: (pat: any) => void;
}

interface DiagramProps {
  haps: Hap<string | number>[];
  span: Span;
  title?: string;
  steps?: number;
}

export function Diagram({ haps, span, title, steps }: DiagramProps) {
  const rows = splitIntoRows(haps);

  const height = rows.length * 50 + 70;

  return (
    <Scale.Provider value={{ ...defaultScale, span, steps }}>
      <svg width="500" height={height}>
        <text x="5" y="20" fill="#fff" font-family="monospace">
          {title}
        </text>
        {...rows.map((rowHaps, index) => (
          <g transform={`translate(5, ${30 + 50 * index})`}>
            <Row haps={rowHaps} />
          </g>
        ))}
        <g transform={`translate(5, ${30 + 50 * (rows.length - 1)})`}>
          <Axis />
        </g>
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

interface RowProps {
  haps: Hap<string | number>[];
}

export function Row({ haps }: RowProps) {
  const {
    canvas: { vert, horiz },
    span,
  } = useContext(Scale);

  return (
    <>
      <line
        x1={horiz.begin}
        x2={horiz.end}
        y1={vert.begin}
        y2={vert.begin}
        stroke="#FFF"
        stroke-width={2}
      />
      <line
        x1={horiz.begin}
        x2={horiz.end}
        y1={vert.end}
        y2={vert.end}
        stroke="#FFF"
        stroke-width={2}
      />
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || haps[0].part.begin !== span.begin) && (
          <line
            x1={horiz.begin + 1}
            x2={horiz.begin + 1}
            y1={vert.begin}
            y2={vert.end}
            stroke="#FFF"
            stroke-width={2}
          />
        )
      }
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || haps[haps.length - 1].part.end !== span.end) && (
          <line
            x1={horiz.end - 1}
            x2={horiz.end - 1}
            y1={vert.begin}
            y2={vert.end}
            stroke="#FFF"
            stroke-width={2}
          />
        )
      }
      {haps.map(({ whole, part, value }) => (
        <Hap
          whole={whole}
          part={part}
          label={typeof value === "string" ? value : value.toString()}
        />
      ))}
    </>
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
    let x = map(i, span, contract(2, horiz));

    if (i === Math.trunc(i)) {
      ticks.push(
        <>
          <line
            x1={x}
            x2={x}
            y1={vert.end}
            y2={vert.end + 15}
            stroke="#FFF"
            stroke-width={2}
          />
          <text
            x={x}
            y={vert.end + 18}
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
          y1={vert.end + 0}
          y2={vert.end + 15}
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

  const x1 = map(begin, span, contract(2, horiz));
  const x2 = map(end, span, contract(2, horiz));

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
        fill={hasOnset ? "#ffffff33" : "#ffffff11"}
        stroke="none"
      />
      <line
        x1={x1}
        y1={y1}
        x2={x1}
        y2={y2}
        stroke="#fff"
        stroke-width="2"
        stroke-dasharray={hasOnset ? undefined : "5"}
      />
      <line
        x1={x2}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#fff"
        stroke-width="2"
        stroke-dasharray={hasOffset ? undefined : "5"}
      />
      <text
        x={x1 + (x2 - x1) * 0.5}
        y={vert.begin + length(vert) * 0.5}
        fill="white"
        text-anchor="middle"
        dominant-baseline="middle"
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
