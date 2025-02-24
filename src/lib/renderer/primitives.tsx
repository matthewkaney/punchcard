import { splitProps } from "solid-js";
import { Fraction } from "fraction.js";
import { FractionInput } from "../Span";

interface LineProps {
  x1: FractionInput;
  y1: FractionInput;
  x2: FractionInput;
  y2: FractionInput;
  dashed?: boolean;
}

export function Line(props: LineProps) {
  return (
    <line
      x1={new Fraction(props.x1).valueOf()}
      y1={new Fraction(props.y1).valueOf()}
      x2={new Fraction(props.x2).valueOf()}
      y2={new Fraction(props.y2).valueOf()}
      stroke="currentcolor"
      stroke-width={2}
      stroke-dasharray={props.dashed ? "5" : undefined}
    />
  );
}

type LineVProps = Omit<LineProps, "x1" | "x2"> & { x: FractionInput };

Line.V = (props: LineVProps) => {
  let [lineV, rest] = splitProps(props, ["x"]);
  return <Line x1={lineV.x} x2={lineV.x} {...rest} />;
};

type LineHProps = Omit<LineProps, "y1" | "y2"> & { y: FractionInput };

Line.H = (props: LineHProps) => {
  let [lineH, rest] = splitProps(props, ["y"]);
  return <Line y1={lineH.y} y2={lineH.y} {...rest} />;
};
