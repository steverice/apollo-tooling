interface Array<T> {
  flat<U>(this: ReadonlyArray<U>[], depth?: 1): U[];
  flatMap<U>(
    callbackfn: (value: T, index: number, array: T[]) => ReadonlyArray<U> | U,
    thisArg?: this
  ): U[];
}
