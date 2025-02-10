// @ts-nocheck
import { mini } from "@strudel/mini";
import { Diagram } from "./diagram";

interface StrudelMiniProps {
  miniPattern: string;
  span?: [number, number];
}

const spanToNumbers = (span: Span) => ({
  begin: span.begin.valueOf(),
  end: span.end.valueOf(),
});

export function StrudelMini({ miniPattern, span }: StrudelMiniProps) {
  const [begin, end] = span ?? [0, 1];
  const pattern = mini(miniPattern);
  const haps = pattern.queryArc(begin, end).map(({ whole, part, value }) => ({
    whole: whole ? spanToNumbers(whole) : undefined,
    part: spanToNumbers(part),
    value,
  }));

  return (
    <Diagram title={`"${miniPattern}"`} haps={haps} span={{ begin, end }} />
  );
}
