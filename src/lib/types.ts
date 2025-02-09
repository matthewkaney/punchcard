export interface Span {
  begin: number;
  end: number;
}

export interface Hap<A> {
  whole?: Span;
  part: Span;
  value: A;
}
