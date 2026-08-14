import { artBackground, artOf, cardBackArt, definitionOf, type GameModel } from '~/entities/game';
import { DRAG_TYPES } from '~/features/drag-drop/dragModel';
import { DropTarget } from './DropTarget';

/**
 * The Deck and the Discard pile, as places on the board.
 *
 * They had no DOM of their own, which cost twice. A player could not see the
 * Deck running down, though an empty Deck is one of the two endgame triggers —
 * the match can end from a fact the board never showed. And a card moving to or
 * from either pile had nowhere to fly from, which is what an animation needs:
 * a stable element to measure.
 *
 * The Deck shows its back, because face-down is the whole point of a draw pile.
 * The Discard shows its top card face up, which is what makes `Land
 * Reclamation` — "take a card from the discard" — a decision rather than a
 * guess.
 */
export function DeckZone(props: {
	match: GameModel;
	/** Dropping a card here plays it — only during the viewer's PLAYING phase. */
	droppable?: boolean;
}) {
	const { match, droppable = false } = props;
	const top = match.discard[match.discard.length - 1] ?? null;
	const topArt = top ? artBackground(artOf(definitionOf(match, top), 'SMALL')) : null;
	const backArt = artBackground(cardBackArt('SMALL'));

	return (
		<div className="panel">
			<h4 className="section-title">Piles</h4>
			<div className="deck-zone">
				<div className="pile" data-zone="deck">
					{match.deck.length > 0 ? (
						<div className="pile-card" style={backArt ? { backgroundImage: backArt } : undefined} />
					) : (
						<div className="pile-card empty">empty</div>
					)}
					<small className="pile-label">Deck {match.deck.length}</small>
				</div>

				<DropTarget
					zone={{ kind: 'discard' }}
					accept={DRAG_TYPES.handCard}
					disabled={!droppable}
					className="pile"
					title={droppable ? 'Drop a card here to play it' : undefined}>
					{top ? (
						<div
							className="pile-card"
							data-card-id={top}
							style={topArt ? { backgroundImage: topArt } : undefined}
							title={definitionOf(match, top).name}
						/>
					) : (
						<div className="pile-card empty">empty</div>
					)}
					<small className="pile-label">Discard {match.discard.length}</small>
				</DropTarget>
			</div>
		</div>
	);
}
