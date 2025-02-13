import { Span } from "./Span";
import { Hap } from "./Hap";

export function intersectHaps<A>(span: Span, haps: Hap<A>[]) {
  return haps.map((hap) => hap.intersect(span)).filter((hap) => hap !== null);
}

export function sortByOnset<A>(haps: Hap<A>[]): Hap<A>[] {
  return haps.toSorted((a, b) =>
    Math.sign(a.part.begin.sub(b.part.begin).valueOf())
  );
}

export function splitIntoRows<A>(haps: Hap<A>[]): Hap<A>[][] {
  let rows: Hap<A>[][] = [];

  for (let hap of sortByOnset(haps)) {
    let foundRow = false;

    for (let row of rows) {
      if (row.length === 0 || row[row.length - 1].part.end <= hap.part.begin) {
        row.push(hap);
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rows.push([hap]);
    }
  }

  return rows;
}
