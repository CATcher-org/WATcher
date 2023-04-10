export interface Accumulator<U> {
  add(o: U): void;
  sub(o: U): void;
}

abstract class RangeQueries<T extends Accumulator<T>> {
  /**
   * Find RSQ(1, a)
   * @param a index to stop at
   * @returns prefix sum to index a
   */
  abstract prefixSum(a: number): T;

  /**
   * Find range search query of elements between index a and index b inclusive
   * @param a start of range (inclusive)
   * @param b end of range (inclusive)
   * @returns sum of elements between arr[a] to arr[b]
   */
  rsq(a: number, b: number): T {
    const ret = this.prefixSum(b);
    if (a !== 1) {
      ret.sub(this.prefixSum(a - 1));
    }
    return ret;
  }

  /**
   * Retrieve the item at the given index
   * @param index
   * @returns
   */
  get(index: number): T {
    return this.rsq(index, index);
  }
}

/**
 * 1-Indexed Prefix Sum to abstract away rsq operations
 */
export class PrefixSum<T extends Accumulator<T>> extends RangeQueries<T> {
  constructor(private arr: T[], private identity: () => T) {
    super();
    for (let i = 1; i < arr.length; i++) {
      arr[i].add(arr[i - 1]);
    }
  }

  prefixSum(a: number): T {
    const ret = this.identity();
    ret.add(this.arr[a]);
    return ret;
  }
}
