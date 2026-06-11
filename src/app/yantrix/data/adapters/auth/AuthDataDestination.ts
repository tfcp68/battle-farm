import { createDataDestinationAdapter, NamedDataDestination, type TAutomataEventMetaType, uniqId } from '@yantrix/core';
import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/shared/services/createServices';
import type { WindowEventId, WindowEventMetaMap } from '~/app/yantrix/types';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { parseEventMeta } from '~/app/yantrix/eventSchemas';
import { setCurrentPlayerId } from '~/entities/auth/queries';
import type { AuthOutput } from './AuthDataSource';

/** Input packet passed to the resolver. */
export interface AuthInput {
	mode: 'signIn' | 'signUp';
	nickname: string;
	password: string;
}

type DomainEvent = TAutomataEventMetaType<WindowEventId, WindowEventMetaMap>;

function errorMessage(err: unknown): string {
	if (err instanceof Error && err.message) return err.message;
	if (typeof err === 'string' && err) return err;
	return 'Something went wrong. Please try again.';
}

/**
 * Base produced by the framework's `createDataDestinationAdapter` mixin
 * applied to `NamedDataDestination<AuthInput, AuthOutput>`.
 */
const Base = createDataDestinationAdapter<
	WindowEventId,
	WindowEventMetaMap,
	null,
	AuthInput,
	AuthOutput
>()(NamedDataDestination<AuthInput, AuthOutput>);

export interface AuthDataDestinationOpts {
	id?: string;
	services: Services;
	queryClient: QueryClient;
	/**
	 * Invoked with the resolver result after the async work completes.
	 * The factory wires this to push the result into the paired {@link AuthDataSource}
	 */
	onResolved: (data: AuthOutput) => void;
}

/**
 * Data Destination half of the auth request/response promise adapter.
 *
 * Mirrors the role of the (private) DataDestination constructed inside
 * `IOPromiseAdapter.createPromiseDataAdapter`:
 *   - Subscribes to `auth_requested` via `createTrigger`, mapping the event meta
 *     to an `AuthInput` packet through {@link AuthDataDestination#requestMapper}.
 *   - Runs the async resolver that calls the auth controller, persists the
 *     local player id, invalidates the TanStack Query cache, and returns a
 *     discriminated {@link AuthOutput}.
 *   - Passes the resolved value to `onResolved` so the paired Data Source can
 *     deposit it into its queue and emit the follow-up event.
 */
export class AuthDataDestination extends Base {
	constructor(opts: AuthDataDestinationOpts) {
		const { services, queryClient, onResolved } = opts;

		super({
			id: opts.id ?? `auth_data_destination_${uniqId(4)}`,
			resolver: async (data: AuthInput): Promise<AuthOutput> => {
				const result = await AuthDataDestination.resolveAuth(services, queryClient, data);
				onResolved(result);
				return result;
			},
		});

		this.createTrigger(
			[WindowDomainEvents.auth_requested],
			(event: DomainEvent) => this.requestMapper(event),
		);
	}

	/** Extract a valid `AuthInput` from a domain event's meta, or null to skip. */
	private requestMapper(event: DomainEvent): AuthInput | null {
		const meta = parseEventMeta(event.meta);
		const { mode, nickname, password } = meta;
		if (!mode || !nickname || !password) return null;
		return { mode, nickname, password };
	}

	/** The actual auth side effect. Pulled out as a static so it doesn't capture `this`. */
	private static async resolveAuth(
		services: Services,
		queryClient: QueryClient,
		data: AuthInput,
	): Promise<AuthOutput> {
		if (!data.mode || !data.nickname || !data.password) {
			return { ok: false, error: 'Please enter a nickname and password.' };
		}
		try {
			const result = await (data.mode === 'signUp'
				? services.controllers.auth.register(data.nickname, data.password)
				: services.controllers.auth.signIn(data.nickname, data.password));
			const playerId = result?.player?.playerId;
			if (!playerId)
				throw new Error('No player ID returned from auth');

			setCurrentPlayerId(playerId);
			await queryClient.invalidateQueries({ queryKey: ['auth', 'currentPlayer'] });

			return { ok: true, playerId };
		} catch (err: unknown) {
			return { ok: false, error: errorMessage(err) };
		}
	}
}
