import { useCallback, useSyncExternalStore } from 'react';
import type { IModelStore } from './ModelStore';

/**
 * React binding for the Data Model store — the read half of the MVC triad.
 *
 * `useSyncExternalStore` is the whole implementation on purpose: the store holds
 * one immutable snapshot and swaps it wholesale, which is exactly the contract
 * the hook is built around. Nothing here caches, and nothing needs to.
 *
 * **`select` must project, not construct.** It may return the model, a field of
 * it, or a primitive — anything already living in the snapshot. It must not
 * build a new object or array (`(m) => m.match?.order.map(...)`), because React
 * compares snapshots by identity: a fresh reference on every call reads as
 * "the store changed again" and the component re-renders forever. Derive in the
 * component body instead, where a `useMemo` can hold the result.
 *
 * When the Effect/Model prototype moves upstream this hook goes to
 * `@yantrix/react`, next to `useFSM`.
 */
export function useModel<TModel extends object, TSlice>(
	store: IModelStore<TModel>,
	select: (model: TModel) => TSlice,
): TSlice {
	const subscribe = useCallback((onChange: () => void) => store.subscribe(onChange), [store]);
	const getSnapshot = useCallback(() => select(store.get()), [store, select]);

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
