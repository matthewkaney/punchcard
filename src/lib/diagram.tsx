import { createContext, VNode } from "preact";
import { useContext } from "preact/hooks";

import { Fraction } from "fraction.js";
import { Span } from "./Span";
import { Hap } from "./Hap";
import { intersectHaps, splitIntoRows } from "./haps";

interface ScaleSpec {
  span: Span;
  steps?: number;
  canvas: { horiz: Span; vert: Span };
}

const defaultScale = {
  span: new Span(0, 1),
  canvas: { horiz: new Span(0, 490), vert: new Span(0, 50) },
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
  highlight?: Span;
}

export function Diagram({ haps, span, title, steps, highlight }: DiagramProps) {
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
            <Row haps={rowHaps} highlight={highlight} />
          </g>
        ))}
        <g transform={`translate(5, ${30 + 50 * (rows.length - 1)})`}>
          <Axis />
        </g>
      </svg>
    </Scale.Provider>
  );
}

interface RowProps {
  haps: Hap<string | number>[];
  highlight?: Span;
}

export function Row({ haps, highlight }: RowProps) {
  const { span } = useContext(Scale);

  return (
    <>
      <g style="color: #6f778c">
        <RowSlice
          haps={haps}
          slice={
            highlight
              ? span.crop(span.begin, highlight.begin)
              : new Span(span.begin, span.begin)
          }
        />
      </g>
      <g style="color: #ffffff">
        <RowSlice
          haps={haps}
          slice={highlight ? span.intersect(highlight) : span}
        />
      </g>
      <g style="color: #6f778c">
        <RowSlice
          haps={haps}
          slice={
            highlight
              ? span.crop(highlight.end, span.end)
              : new Span(span.end, span.end)
          }
        />
      </g>
    </>
  );
}

type VisibleEdge = "left" | "right" | "both" | "none";

interface RowSliceProps {
  haps: Hap<String | number>[];
  slice: Span | null;
  showEdge?: VisibleEdge;
}

export function RowSlice({ haps, slice, showEdge }: RowSliceProps) {
  if (slice === null || slice.length.equals(0)) {
    return undefined;
  }

  const leftEdge = showEdge === "right" || showEdge === "none" ? 1 : -1;
  const rightEdge = showEdge === "left" || showEdge === "none" ? 1 : -1;

  const {
    canvas: { vert, horiz },
    span,
  } = useContext(Scale);

  let sliceHoriz = horiz.map(slice, span);
  let visibleSlice = sliceHoriz.contract(leftEdge, rightEdge);

  return (
    <>
      <Line.H x1={visibleSlice.begin} x2={visibleSlice.end} y={vert.begin} />
      <Line.H x1={visibleSlice.begin} x2={visibleSlice.end} y={vert.end} />
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || !haps[0].part.begin.equals(span.begin)) && (
          <Line.V x={sliceHoriz.begin} y1={vert.begin} y2={vert.end} />
        )
      }
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 ||
          !haps[haps.length - 1].part.end.equals(span.end)) && (
          <Line.V x={sliceHoriz.end} y1={vert.begin} y2={vert.end} />
        )
      }
      {intersectHaps(slice, haps).map(({ whole, part, value }) => (
        <HapRenderer
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
  const firstStep = Math.ceil(span.begin.valueOf() * steps) / steps;

  for (let i = firstStep; i <= span.end.valueOf(); i += 1 / steps) {
    let x = horiz.contract(2).map(i, span);

    if (i === Math.trunc(i)) {
      ticks.push(
        <>
          <Line.V x={x} y1={vert.end} y2={vert.end.add(15)} />
          <text
            x={x.valueOf()}
            y={vert.end.add(18).valueOf()}
            fill="white"
            text-anchor="middle"
            dominant-baseline="hanging"
          >
            {i}
          </text>
        </>
      );
    } else {
      ticks.push(<Line.V x={x} y1={vert.end.add(0)} y2={vert.end.add(15)} />);
    }
  }

  return <>{...ticks}</>;
}

interface HapProps {
  whole?: Span;
  part: Span;
  label: string;
}

export function HapRenderer({ whole, part, label }: HapProps) {
  const {
    span,
    canvas: { horiz, vert },
  } = useContext(Scale);
  const { begin, end } = part;

  const x1 = horiz.contract(2).map(begin, span);
  const x2 = horiz.contract(2).map(end, span);

  const { begin: y1, end: y2 } = vert;

  let hasOnset = whole?.begin.equals(begin) ?? false;
  let hasOffset = whole?.end.equals(end) ?? false;

  return (
    <>
      <rect
        x={x1.valueOf()}
        y={y1.valueOf()}
        width={x2.sub(x1).valueOf()}
        height={vert.length.valueOf()}
        fill={hasOnset ? "#ffffff33" : "#ffffff11"}
        stroke="none"
      />
      <Line.V x={x1} y1={y1} y2={y2} />
      <Line.V x={x2} y1={y1} y2={y2} />
      <text
        x={x1.add(x2.sub(x1).mul(0.5)).valueOf()}
        y={vert.begin.add(vert.length.mul(0.5)).valueOf()}
        fill="currentcolor"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {label}
      </text>
    </>
  );
}

type style = "solid" | "dashed" | "hidden";

interface SpanProps {
  x: number;
  y: number;
  width: number;
  height: number;
  left?: style;
  right?: style;
}

function SpanRenderer({ x, y, width, height, left, right }: SpanProps) {
  const strokeWidth = 2;

  return (
    <>
      {(left === "solid" || left === "dashed") && (
        <line
          x1={x + strokeWidth / 2}
          y1={y}
          x2={x + strokeWidth / 2}
          y2={y + height}
          stroke="currentcolor"
          stroke-width={strokeWidth}
          stroke-dasharray={left === "dashed" ? 5 : undefined}
        />
      )}
      {(right === "solid" || right === "dashed") && (
        <line
          x1={x + width + strokeWidth / 2}
          y1={y}
          x2={x + width + strokeWidth / 2}
          y2={y + height}
          stroke="currentcolor"
          stroke-width={strokeWidth}
          stroke-dasharray={right === "dashed" ? 5 : undefined}
        />
      )}
    </>
  );
}

/* Drawing Primitives */

interface LineProps {
  x1: Fraction;
  y1: Fraction;
  x2: Fraction;
  y2: Fraction;
}

function Line({ x1, y1, x2, y2 }: LineProps) {
  return (
    <line
      x1={x1.valueOf()}
      y1={y1.valueOf()}
      x2={x2.valueOf()}
      y2={y2.valueOf()}
      stroke="currentcolor"
      stroke-width={2}
      // stroke-dasharray={right === "dashed" ? 5 : undefined}
    />
  );
}

type LineVProps = Omit<LineProps, "x1" | "x2"> & { x: Fraction };

Line.V = ({ x, ...props }: LineVProps) => {
  return <Line x1={x} x2={x} {...props} />;
};

type LineHProps = Omit<LineProps, "y1" | "y2"> & { y: Fraction };

Line.H = ({ y, ...props }: LineHProps) => {
  return <Line y1={y} y2={y} {...props} />;
};
