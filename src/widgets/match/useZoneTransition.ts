import { useLayoutEffect, useRef } from 'react';

/**
 * Cards fly between zones when the model says they moved.
 *
 * **Bound to the model diff, not to the click.** The model is replicated: a
 * guest sees the host's move arrive as a snapshot commit with no local
 * interaction at all. An animation hung off a click handler would play for
 * exactly one player out of six, and the other five would watch cards
 * teleport.
 *
 * The technique is FLIP, keyed by `data-card-id` rather than by DOM node.
 * `CardInstanceId` is a stable branded id — the same card carries the same key
 * whichever zone renders it — so a card that moves from the hand to a bed is
 * matched across two completely different elements. That is what makes this
 * work without a shared-element library: React is free to unmount the old node
 * and mount a new one, and the card still travels the distance between them.
 *
 * Cost is one `getBoundingClientRect` pass per rendered card per commit, which
 * is a layout read of a few dozen elements — cheap next to the commit that
 * caused it. The animation never delays an intent: the model is already
 * committed and this is a purely visual layer running after paint.
 */

/** One commit's worth of movement, capped so a phase never waits on the board. */
const DURATION_MS = 320;
/** Many cards moving at once (a deal, a harvest) stagger inside the same budget. */
const STAGGER_MS = 30;
const MAX_STAGGER_MS = 80;

type Rects = Map<string, DOMRect>;

function measure(root: ParentNode): Rects {
	const rects: Rects = new Map();
	for (const node of root.querySelectorAll<HTMLElement>('[data-card-id]')) {
		const id = node.dataset.cardId;
		if (id) rects.set(id, node.getBoundingClientRect());
	}
	return rects;
}

const prefersReducedMotion = (): boolean =>
	typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/**
 * Call once, high in the match screen. `revision` is any value that changes
 * exactly when the model commits — `match.version` does the job, since the
 * engine bumps it on every commit precisely so a guest can drop a stale
 * snapshot.
 */
export function useZoneTransition(revision: number | null): void {
	const previous = useRef<Rects>(new Map());

	useLayoutEffect(() => {
		const current = measure(document);

		if (prefersReducedMotion()) {
			previous.current = current;
			return;
		}

		let moved = 0;
		for (const [id, to] of current) {
			const from = previous.current.get(id);
			if (!from) continue;

			const dx = from.left - to.left;
			const dy = from.top - to.top;
			// Sub-pixel drift is layout noise, not a move.
			if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;

			const node = document.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(id)}"]`);
			if (!node?.animate) continue;

			node.animate(
				[
					{ transform: `translate(${dx}px, ${dy}px)`, offset: 0 },
					{ transform: 'translate(0, 0)', offset: 1 },
				],
				{
					duration: DURATION_MS,
					delay: Math.min(moved * STAGGER_MS, MAX_STAGGER_MS),
					easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
					fill: 'both',
				},
			);
			moved += 1;
		}

		previous.current = current;
	}, [revision]);
}
