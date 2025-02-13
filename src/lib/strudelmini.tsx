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

export function StrudelMini({
  miniPattern,
  span,
  highlight,
}: StrudelMiniProps) {
  const pattern = mini(miniPattern);
  return (
    <StrudelPattern
      title={`"${miniPattern}"`}
      pattern={pattern}
      span={span}
      highlight={highlight}
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

export function StrudelPattern({
  title,
  pattern,
  span,
  highlight,
}: StrudelPatternProps) {
  const [begin, end] = span ?? [0, 1];
  const haps = pattern
    .queryArc(begin, end)
    .map(
      ({ whole, part, value }) =>
        new Hap(portSpan(whole), portSpan(part), value)
    );

  return (
    <Diagram
      title={title}
      haps={haps}
      span={new Span(begin, end)}
      steps={pattern.tactus}
      highlight={highlight ? new Span(highlight[0], highlight[1]) : undefined}
    />
  );
}
