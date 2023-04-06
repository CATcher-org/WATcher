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
 * Binary Indexed Tree enables fast Range search queries calculations in O(log n) time
 * This Tree is 1-indexed
 */
export class FenwickTree<T extends Accumulator<T>> extends RangeQueries<T> {
  private internalArray: T[];

  constructor(size: number, private identityFun: () => T) {
    super();
    this.internalArray = new Array<T>(size + 1);
    for (let i = 0; i <= size; i++) {
      this.internalArray[i] = identityFun();
    }
  }

  prefixSum(a: number): T {
    let ret = this.identityFun();
    for (; a > 0; a -= a & -a) {
      ret.add(this.internalArray[a]);
    }
    return ret;
  }

  /**
   * Adjust the value of element at index A
   * @param index A
   * @param change
   */
  adjust(index: number, change: T) {
    for (; index < this.internalArray.length; index += index & -index) {
      this.internalArray[index].add(change);
    }
  }
}
