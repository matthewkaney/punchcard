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
  let rows = splitIntoRows(haps);

  if (rows.length === 0) {
    rows = [[]];
  }

  const width = 500;
  const height = rows.length * 50 + 70;

  return (
    <Scale.Provider value={{ ...defaultScale, span, steps }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
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
          showEdge="left"
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
          showEdge="right"
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

  let renderedHaps: VNode[] = [];

  // Slice haps
  haps = intersectHaps(slice, haps);

  for (let i = 0; i < haps.length; ++i) {
    let hap = haps[i];
    let { value } = hap;
    let beginStyle: EdgeStyle, endStyle: EdgeStyle;

    if (i === 0) {
      beginStyle =
        hap.follows(slice.begin) && leftEdge === 1 ? "none" : "visible";
    } else {
      beginStyle = "visible";
    }

    if (i === haps.length - 1) {
      endStyle = hap.leads(slice.end) && rightEdge === 1 ? "none" : "visible";
    } else {
      endStyle = hap.leads(haps[i + 1]) ? "none" : "visible";
    }

    renderedHaps.push(
      <HapRenderer
        hap={hap}
        beginStyle={beginStyle}
        endStyle={endStyle}
        label={typeof value === "string" ? value : JSON.stringify(value)}
      />
    );
  }

  return (
    <>
      <Line.H
        x1={visibleSlice.begin}
        x2={visibleSlice.end}
        y={vert.begin.sub(1)}
      />
      <Line.H
        x1={visibleSlice.begin}
        x2={visibleSlice.end}
        y={vert.end.add(1)}
      />
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || !haps[0].follows(slice.begin)) && (
          <Line.V x={sliceHoriz.begin} y1={vert.begin} y2={vert.end} />
        )
      }
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || !haps[haps.length - 1].leads(slice.end)) && (
          <Line.V x={sliceHoriz.end} y1={vert.begin} y2={vert.end} />
        )
      }
      {renderedHaps}
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

  const steps = new Fraction(providedSteps ?? 1);
  const firstStep = span.begin.mul(steps).ceil().div(steps);

  for (let i = firstStep; i.lte(span.end); i = i.add(steps.inverse())) {
    let x = horiz.map(i, span);

    if (i.mod().equals(0)) {
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
            {i.toString()}
          </text>
        </>
      );
    } else {
      ticks.push(<Line.V x={x} y1={vert.end.add(0)} y2={vert.end.add(15)} />);
    }
  }

  return <>{...ticks}</>;
}

type EdgeStyle = "visible" | "nudged" | "none";

interface HapProps {
  hap: Hap<unknown>;
  label: string;
  beginStyle?: EdgeStyle;
  endStyle?: EdgeStyle;
}

export function HapRenderer({
  hap: { part, hasOnset, hasOffset },
  label,
  beginStyle,
  endStyle,
}: HapProps) {
  const {
    span,
    canvas: { horiz, vert },
  } = useContext(Scale);
  const horizSpan = horiz
    .map(part, span)
    .contract(beginStyle === "nudged" ? 3 : 0, endStyle === "nudged" ? 3 : 0);
  const horizInner = horizSpan.contract(2);

  const { begin: y1, end: y2 } = vert;

  return (
    <>
      <rect
        x={horizInner.begin.valueOf()}
        y={y1.valueOf()}
        width={horizInner.length.valueOf()}
        height={vert.length.valueOf()}
        fill={hasOnset ? "#ffffff33" : "#ffffff11"}
        stroke="none"
      />
      {beginStyle !== "none" && (
        <Line.V x={horizSpan.begin} y1={y1} y2={y2} dashed={!hasOnset} />
      )}
      {endStyle !== "none" && (
        <Line.V x={horizSpan.end} y1={y1} y2={y2} dashed={!hasOffset} />
      )}
      <text
        x={horizInner.map(new Fraction(1, 2)).valueOf()}
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

/* Drawing Primitives */

interface LineProps {
  x1: Fraction;
  y1: Fraction;
  x2: Fraction;
  y2: Fraction;
  dashed?: boolean;
}

function Line({ x1, y1, x2, y2, dashed }: LineProps) {
  return (
    <line
      x1={x1.valueOf()}
      y1={y1.valueOf()}
      x2={x2.valueOf()}
      y2={y2.valueOf()}
      stroke="currentcolor"
      stroke-width={2}
      stroke-dasharray={dashed ? 5 : undefined}
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
