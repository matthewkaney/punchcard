import {
  createSignal,
  createEffect,
  createContext,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js";

import { createElementSize } from "@solid-primitives/resize-observer";

import { Fraction } from "fraction.js";
import { Span } from "./Span";
import { Hap } from "./Hap";
import { intersectHaps, splitIntoRows } from "./haps";

import { Line } from "./renderer/primitives";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const CurrentRect = createContext<() => Rect>(() => ({
  left: 0,
  top: 0,
  width: 100,
  height: 50,
}));

const CurrentSpan = createContext(() => new Span(0, 1));

interface DiagramProps {
  haps: Hap<string | number>[];
  span: Span;
  title?: string;
  steps?: number;
  highlight?: Span;
}

export function Diagram(props: DiagramProps) {
  const [target, setTarget] = createSignal<HTMLElement>();
  const size = createElementSize(target);

  const margin = { left: 5, right: 5 };

  const currentRect = () => ({
    left: margin.left,
    top: 0,
    width: (size.width ?? 100) - (margin.left + margin.right),
    height: 50,
  });

  const rows = () => {
    const hapRows = splitIntoRows(props.haps);
    return hapRows.length > 0 ? hapRows : [[]];
  };

  return (
    <CurrentRect.Provider value={currentRect}>
      <CurrentSpan.Provider value={() => props.span}>
        <svg ref={setTarget} viewBox={`0 0 ${size.width} ${size.height}`}>
          <text x="5" y="20" fill="#fff" font-family="monospace">
            {props.title}
          </text>
          {...rows().map((rowHaps, index) => (
            <g transform={`translate(0, ${30 + 50 * index})`}>
              <Row haps={rowHaps} highlight={props.highlight} />
            </g>
          ))}
          <g transform={`translate(0, ${30 + 50 * (rows.length - 1)})`}>
            {/* <Axis /> */}
          </g>
        </svg>
      </CurrentSpan.Provider>
    </CurrentRect.Provider>
  );
}

interface RowProps {
  haps: Hap<string | number>[];
  highlight?: Span;
}

export function Row({ haps, highlight }: RowProps) {
  const currentSpan = useContext(CurrentSpan);

  // TODO: Currently we're rendering non-highlighted slices as zero-length,
  // but we should do something more sophisticated to just avoid that rendering code as necessary
  return (
    <>
      <g style="color: #6f778c">
        <RowSlice
          haps={haps}
          slice={
            highlight
              ? currentSpan().crop(currentSpan().begin, highlight.begin)
              : new Span(currentSpan().begin, currentSpan().begin)
          }
          showEdge="left"
        />
      </g>
      <g style="color: #ffffff">
        <RowSlice
          haps={haps}
          slice={highlight ? currentSpan().intersect(highlight) : currentSpan()}
        />
      </g>
      <g style="color: #6f778c">
        <RowSlice
          haps={haps}
          slice={
            highlight
              ? currentSpan().crop(highlight.end, currentSpan().end)
              : new Span(currentSpan().end, currentSpan().end)
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
  // TODO: This is currently not reactive
  if (slice === null || slice.length.equals(0)) {
    return undefined;
  }

  const currentRect = useContext(CurrentRect);
  const currentSpan = useContext(CurrentSpan);

  const top = () => currentRect().top + 1;
  const bottom = () => currentRect().top + currentRect().height - 1;

  const leftEdge = showEdge === "right" || showEdge === "none" ? 1 : -1;
  const rightEdge = showEdge === "left" || showEdge === "none" ? 1 : -1;

  const visibleSlice = () => {
    return new Span(
      currentRect().left,
      currentRect().left + currentRect().width
    )
      .map(slice, currentSpan())
      .contract(leftEdge, rightEdge);
  };

  let renderedHaps: JSX.Element[] = [];

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
      <Line.H x1={visibleSlice().begin} x2={visibleSlice().end} y={top()} />
      <Line.H x1={visibleSlice().begin} x2={visibleSlice().end} y={bottom()} />
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || !haps[0].follows(slice.begin)) && (
          <Line.V x={visibleSlice().begin} y1={top()} y2={bottom()} />
        )
      }
      {
        /* We're assuming haps are sorted here */
        (haps.length === 0 || !haps[haps.length - 1].leads(slice.end)) && (
          <Line.V x={visibleSlice().end} y1={top()} y2={bottom()} />
        )
      }
      {renderedHaps}
    </>
  );
}

// export function Axis() {
//   const {
//     span,
//     steps: providedSteps,
//     canvas: { vert, horiz },
//   } = useContext(Scale);

//   const ticks: JSX.Element[] = [];

//   const steps = new Fraction(providedSteps ?? 1);
//   const firstStep = span.begin.mul(steps).ceil().div(steps);

//   for (let i = firstStep; i.lte(span.end); i = i.add(steps.inverse())) {
//     let x = horiz.map(i, span);

//     if (i.mod().equals(0)) {
//       ticks.push(
//         <>
//           <Line.V x={x} y1={vert.end} y2={vert.end.add(15)} />
//           <text
//             x={x.valueOf()}
//             y={vert.end.add(18).valueOf()}
//             fill="white"
//             text-anchor="middle"
//             dominant-baseline="hanging"
//           >
//             {i.toString()}
//           </text>
//         </>
//       );
//     } else {
//       ticks.push(<Line.V x={x} y1={vert.end.add(0)} y2={vert.end.add(15)} />);
//     }
//   }

//   return <>{...ticks}</>;
// }

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
  const currentRect = useContext(CurrentRect);
  const currentSpan = useContext(CurrentSpan);

  const horizSpan = () =>
    new Span(currentRect().left, currentRect().left + currentRect().width)
      .map(part, currentSpan())
      .contract(beginStyle === "nudged" ? 3 : 0, endStyle === "nudged" ? 3 : 0);
  const horizInner = () => horizSpan().contract(2);

  const top = () => currentRect().top;
  const bottom = () => currentRect().top + currentRect().height;

  return (
    <>
      <rect
        x={horizInner().begin.valueOf()}
        y={currentRect().top}
        width={horizInner().length.valueOf()}
        height={currentRect().height}
        fill={hasOnset ? "#ffffff33" : "#ffffff11"}
        stroke="none"
      />
      {beginStyle !== "none" && (
        <Line.V
          x={horizSpan().begin}
          y1={top()}
          y2={bottom()}
          dashed={!hasOnset}
        />
      )}
      {endStyle !== "none" && (
        <Line.V
          x={horizSpan().end}
          y1={top()}
          y2={bottom()}
          dashed={!hasOffset}
        />
      )}
      <text
        x={horizInner().map("1/2").valueOf()}
        y={top() + currentRect().height * 0.5}
        fill="currentcolor"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {label}
      </text>
    </>
  );
}
