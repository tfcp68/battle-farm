import type { ReactNode } from 'react';
import { artBackground, artOf, type CardDefinition, type CardInstanceId, isCropDefinition } from '~/entities/game';

/**
 * One card, everywhere a card is shown — hand, market, bed, trade offer.
 *
 * The art is a background rather than an `<img>`: the text layer has to stay on
 * top of it, because the picture carries no rules text and the tooltip is the
 * only place a player can read what the card does. A card with no art in the
 * dictionary keeps the plain coloured face it always had — `artPathOf` returns
 * `null` instead of throwing precisely so this stays a rendering decision.
 *
 * `value` is passed in rather than read off the definition: a planted crop
 * carries its own `Crop Value`, and half the deck exists to change it.
 */
export function CardFace(props: {
	definition: CardDefinition;
	value: number;
	/**
	 * The instance, where there is one. Rendered as `data-card-id` so
	 * `useZoneTransition` can follow this card from one zone to another — the
	 * market slot and the hand render different elements for the same card.
	 */
	cardId?: CardInstanceId;
	/** Price, reap timer, owner — whatever the surrounding zone adds. */
	footer?: ReactNode;
	selected?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	/**
	 * Attached by {@link DraggableCard}. A `disabled` button receives no pointer
	 * events, so a draggable card is never disabled — dragging is the gesture
	 * that stays available when clicking is not the point.
	 */
	elementRef?: (element: HTMLButtonElement | null) => void;
	dragging?: boolean;
}) {
	const { definition, value, cardId, footer, selected, disabled, onClick, elementRef, dragging } = props;
	const crop = isCropDefinition(definition);
	const text = crop ? `${definition.ability.name} — ${definition.ability.text}` : definition.text;
	const art = artBackground(artOf(definition, 'SMALL'));

	return (
		<button
			ref={elementRef}
			className={`card-face${art ? ' has-art' : ''}${selected ? ' selected' : ''}${dragging ? ' dragging' : ''}${crop ? ` crop-${definition.color.toLowerCase()}` : ' action'}`}
			type="button"
			disabled={!elementRef && (disabled || !onClick)}
			onClick={onClick}
			data-card-def={definition.id}
			data-card-id={cardId}
			style={art ? { backgroundImage: art } : undefined}
			title={text}>
			<span className="card-face-head">
				<span className="card-face-name">{definition.name}</span>
				<span className="card-face-value">{value}</span>
			</span>
			<span className="card-face-meta">
				{crop ? definition.color : 'Action'}
				{definition.rarity ? ` · ${definition.rarity}` : ''}
			</span>
			{footer ? <span className="card-face-foot">{footer}</span> : null}
		</button>
	);
}
