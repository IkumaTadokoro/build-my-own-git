export type Branded<T, Brand> = T & { readonly __brand: Brand }

export function assertNever(_: never): never {
  throw new Error('Unexpected value. Should have been never.')
}
