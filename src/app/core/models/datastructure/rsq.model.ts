export interface Accumulator<U> {
  add(operand: U): void;
  subtract(operand: U): void;
}

abstract class RangeQueries<T extends Accumulator<T>> {
  /**
   * Find RSQ(1, a)
   * @param a index to stop at
   * @returns prefix sum to index a
   */
  abstract prefixSum(a: number): T;

  /**
   * Find range sum query of elements between index a and index b inclusive
   * @param a start of range (inclusive)
   * @param b end of range (inclusive)
   * @returns sum of elements between arr[a] to arr[b]
   */
  rsq(a: number, b: number): T {
    const rangeSum = this.prefixSum(b);
    if (a !== 1) {
      rangeSum.subtract(this.prefixSum(a - 1));
    }
    return rangeSum;
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
  /**
   * Constructs a PrefixSum by mutating a given array into a prefix sum array in place
   * @param arr array to be mutated into a prefix sum array
   * @param identity function to create the identity element of the accumulator
   */
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
