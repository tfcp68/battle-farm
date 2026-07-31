import React from 'react';
import JoinRequestPopup from '~/shared/ui/JoinRequestPopup';
import Field from '~/shared/ui/Field';
import { Button } from '~/shared/ui/components/button';
import { useMachines } from '~/app/providers/MachinesContext';
import { useFSM } from '@yantrix/react';
import { useCurrentProfile } from '~/entities/profile/queries';
import { TWindowModeContext } from '~/shared/types/types';
import { useCreateLobby } from '~/features/create-lobby/useCreateLobby';
import { useJoinLobby } from '~/features/join-lobby/useJoinLobby';
import { useProfileActions } from '~/features/profile/useProfileActions';
import { isValidRoomCode, normalizeRoomCode } from '~/shared/net/RoomTransport';
import {
	selectConnectError,
	selectIsConnecting,
	selectIsJoinRequest,
	selectJoinLobbyId,
} from '~/shared/lib/fsm/selectors';

export default function MenuSubmodePage() {
	const { createLobby } = useCreateLobby();
	const { joinByCode, cancelJoin } = useJoinLobby();
	const { changeNickname } = useProfileActions();

	const { mode: modeFSM } = useMachines();
	const { getContext: getModeContext } = useFSM<TWindowModeContext>(modeFSM.instance);
	const modeCtx = getModeContext();

	const { data: profile, isLoading: loadingProfile } = useCurrentProfile();
	const currentPlayerId = profile?.playerId ?? null;

	const [code, setCode] = React.useState('');

	const isJoinRequest = selectIsJoinRequest(modeCtx?.state);
	const isConnecting = selectIsConnecting(modeCtx?.state);
	const joinLobbyId = selectJoinLobbyId(modeCtx);
	const connectError = selectConnectError(modeCtx);
	const didTimeOut = modeCtx?.context?.timedOut === 1;

	const canJoin = !!currentPlayerId && !isConnecting && isValidRoomCode(code);

	if (loadingProfile) {
		return (
			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<small className="muted">Loading profile…</small>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="with-dev">
				<div className="menu-page">
					<div className="menu-card">
						<h3 className="section-title" style={{ margin: 0 }}>
							Main Menu
						</h3>
						<small className="muted">Player: {profile?.nickname ?? 'Unknown'}</small>

						<div className="actions" style={{ width: '100%' }}>
							<Button
								className="primary"
								onClick={() => createLobby()}
								disabled={!currentPlayerId || isConnecting}>
								{isConnecting ? 'Connecting…' : 'Create Room'}
							</Button>
						</div>

						<hr style={{ width: '100%' }} />

						<div style={{ width: '100%' }}>
							<h4 className="section-title" style={{ marginTop: 0 }}>
								Join by code
							</h4>
							<Field
								label="Room code"
								value={code}
								onChange={(value: string) => setCode(normalizeRoomCode(value))}
								placeholder="6 characters, e.g. K7QM2X"
							/>
							<div className="actions">
								<Button
									onClick={() => currentPlayerId && joinByCode(code, currentPlayerId)}
									disabled={!canJoin}>
									{isConnecting ? 'Connecting…' : 'Join'}
								</Button>
							</div>
							<small className="muted">
								Ask the host for their room code — rooms are not listed publicly.
							</small>
						</div>

						<hr style={{ width: '100%' }} />

						{connectError && !isConnecting && (
							<div
								role="alert"
								data-testid="room-connect-error"
								style={{ width: '100%', padding: 8, textAlign: 'center', color: '#a40' }}>
								{connectError}
							</div>
						)}

						{didTimeOut && !isJoinRequest && (
							<div
								role="alert"
								data-testid="join-request-timeout-notice"
								style={{ width: '100%', padding: 8, textAlign: 'center', color: '#a40' }}>
								Your join request timed out. Try again.
							</div>
						)}

						<div style={{ width: '100%', marginTop: 12, display: 'flex', justifyContent: 'center' }}>
							<Button className="danger" style={{ width: '50%' }} onClick={() => changeNickname()}>
								Change nickname
							</Button>
						</div>
					</div>
				</div>
			</div>

			{isJoinRequest && (
				<JoinRequestPopup gameId={joinLobbyId} hostPlayerId={null} onCancel={() => cancelJoin()} />
			)}
		</>
	);
}
