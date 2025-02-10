import { Hap } from "./types";

export function sortByOnset<A>(haps: Hap<A>[]): Hap<A>[] {
  return haps.toSorted((a, b) => Math.sign(a.part.begin - b.part.begin));
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
