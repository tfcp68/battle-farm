/**
 * Nominal typing for values that are structurally identical but must never be
 * swapped — ids, tokens, validated strings.
 *
 * The brand exists only at compile time: a branded value *is* the underlying
 * value at runtime, so it serializes and compares as usual.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };
