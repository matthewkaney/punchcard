import { Span } from "./Span";

export class Hap<A> {
  constructor(
    readonly whole: Span | undefined,
    readonly part: Span,
    readonly value: A
  ) {}

  intersect(span: Span): Hap<A> | null {
    const part = this.part.intersect(span);
    return part ? this.withPart(part) : null;
  }

  withPart(part: Span) {
    return new Hap(this.whole, part, this.value);
  }
}
