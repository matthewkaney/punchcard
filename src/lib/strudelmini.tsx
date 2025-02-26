// @ts-nocheck
import { mini } from "@strudel/mini";

import { Diagram } from "./diagram";
import { Span, FractionInput } from "./Span";
import { Hap } from "./Hap";

interface StrudelMiniProps {
  miniPattern: string;
  span?: [number, number];
  highlight?: [number, number];
}

export function StrudelMini(props: StrudelMiniProps) {
  const pattern = () => mini(miniPattern);
  return (
    <StrudelPattern
      title={`"${props.miniPattern}"`}
      pattern={pattern()}
      span={props.span}
      highlight={props.highlight}
    />
  );
}

export function portSpan(span?: any): Span | undefined {
  if (span === undefined) {
    return undefined;
  }

  return new Span(span.begin, span.end);
}

interface StrudelPatternProps {
  title?: string;
  pattern: any;
  span?: [FractionInput, FractionInput];
}

export function StrudelPattern(props: StrudelPatternProps) {
  const [begin, end] = props.span ?? [0, 1];

  const haps = () =>
    props.pattern
      .queryArc(begin, end)
      .map(
        ({ whole, part, value }) =>
          new Hap(portSpan(whole), portSpan(part), value)
      );

  return (
    <Diagram
      title={props.title}
      haps={haps()}
      span={new Span(begin, end)}
      steps={props.pattern.tactus}
      highlight={
        props.highlight
          ? new Span(props.highlight[0], props.highlight[1])
          : undefined
      }
    />
  );
}
