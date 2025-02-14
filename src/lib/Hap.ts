import { Fraction } from "fraction.js";
import { Span, FractionInput } from "./Span";

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

  get hasOnset() {
    return this.whole?.begin.equals(this.part.begin) ?? false;
  }

  get hasOffset() {
    return this.whole?.end.equals(this.part.end) ?? false;
  }

  follows(previous: FractionInput | Hap<unknown>): boolean {
    if (previous instanceof Hap) {
      return this.follows(previous.part.end);
    } else {
      return this.part.begin.equals(previous);
    }
  }

  leads(next: FractionInput | Hap<unknown>): boolean {
    if (next instanceof Hap) {
      return this.leads(next.part.begin);
    } else {
      return this.part.end.equals(next);
    }
  }
}
