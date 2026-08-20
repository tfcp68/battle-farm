import { BED_DEFINITIONS, CLASS_DEFINITIONS, type GameModel, type PlayerId } from '~/entities/game';

/** Everyone at the table, in turn order, with what the rules make public. */
export function PlayersPanel(props: {
	match: GameModel;
	viewerId: PlayerId | null;
	onInspect?: (playerId: PlayerId) => void;
}) {
	const { match, viewerId, onInspect } = props;

	return (
		<div className="panel">
			<h4 className="section-title">Players</h4>
			<table className="table">
				<thead>
					<tr>
						<th>Player</th>
						<th>Class</th>
						<th>Coins</th>
						<th>Fert.</th>
						<th>Hand</th>
						<th>Beds</th>
					</tr>
				</thead>
				<tbody>
					{match.order.map((playerId) => {
						const player = match.players[playerId];
						if (!player) return null;
						const isActive = match.turn.activePlayerId === playerId;
						const growing = player.beds.filter((bed) => bed.crop).length;

						return (
							<tr
								key={playerId}
								onClick={onInspect ? () => onInspect(playerId) : undefined}
								style={{ cursor: onInspect ? 'pointer' : undefined }}>
								<td style={{ color: isActive ? 'var(--accent)' : undefined }}>
									{player.nickname}
									{playerId === viewerId ? ' (you)' : ''}
									{isActive ? ' ●' : ''}
								</td>
								<td>{CLASS_DEFINITIONS[player.classId].name}</td>
								<td>{player.coins}</td>
								<td>{player.fertilizers}</td>
								<td>{player.hand.length}</td>
								<td title={player.beds.map((bed) => BED_DEFINITIONS[bed.type].name).join(', ')}>
									{growing}/{player.beds.length}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
