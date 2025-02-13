import { Fraction } from "fraction.js";

export type FractionInput = number | string | Fraction;

export function max(value: FractionInput, ...values: FractionInput[]) {
  return values.reduce<Fraction>(
    (prev, current) => (prev.gte(current) ? prev : new Fraction(current)),
    new Fraction(value)
  );
}

export function min(value: FractionInput, ...values: FractionInput[]) {
  return values.reduce<Fraction>(
    (prev, current) => (prev.lte(current) ? prev : new Fraction(current)),
    new Fraction(value)
  );
}

export class Span {
  readonly begin: Fraction;
  readonly end: Fraction;

  constructor(begin: FractionInput, end: FractionInput) {
    this.begin = new Fraction(begin);
    this.end = new Fraction(end);
  }

  get length() {
    return this.end.sub(this.begin);
  }

  crop(begin: FractionInput, end: FractionInput) {
    const span = new Span(max(this.begin, begin), min(this.end, end));
    return span.length.gte(0) ? span : null;
  }

  contract(amount: FractionInput): Span;
  contract(begin: FractionInput, end: FractionInput): Span;
  contract(amountOrBegin: FractionInput, maybeEnd?: FractionInput) {
    let begin: FractionInput, end: FractionInput;
    if (maybeEnd === undefined) {
      begin = end = new Fraction(amountOrBegin).div(2);
    } else {
      begin = amountOrBegin;
      end = maybeEnd;
    }
    return new Span(this.begin.add(begin), this.end.sub(end));
  }

  intersect(other: Span) {
    if (this.end.lte(other.begin) || this.begin.gte(other.end)) {
      return null;
    }

    return new Span(max(this.begin, other.begin), min(this.end, other.end));
  }

  map(value: FractionInput, from?: Span): Fraction;
  map(value: Span, from?: Span): Span;
  map(value: FractionInput | Span, from = new Span(0, 1)) {
    if (value instanceof Span) {
      return new Span(this.map(value.begin, from), this.map(value.end, from));
    } else {
      return new Fraction(value)
        .sub(from.begin)
        .div(from.length)
        .mul(this.length)
        .add(this.begin);
    }
  }
}
