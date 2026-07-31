import ProfileModel from '~/entities/profile/model';
import ProfileController from '~/entities/profile/controller';
import LobbiesModel from '~/entities/lobby/model';
import LobbiesController from '~/entities/lobby/controller';
import { RoomService } from '~/entities/room/RoomService';
import { createStorage } from '~/shared/storage/createStorage';
import { createRoomTransport } from '~/shared/net/createRoomTransport';
import type { StoragePort } from '~/shared/storage/StoragePort';
import type { RoomTransport } from '~/shared/net/RoomTransport';

export interface CreateServicesOpts {
	/** Injected by tests; production picks the driver from `VITE_STORAGE_DRIVER`. */
	storage?: StoragePort;
	/** Injected by tests; production builds a Trystero transport per room. */
	createTransport?: () => RoomTransport;
}

/**
 * Composition root — the only place that picks a storage driver and a transport.
 * Everything downstream takes them as dependencies.
 */
export function createServices(opts: CreateServicesOpts = {}) {
	const storage = opts.storage ?? createStorage();
	const rooms = new RoomService({ createTransport: opts.createTransport ?? createRoomTransport });

	const profileModel = new ProfileModel({ storage });
	const lobbiesModel = new LobbiesModel(rooms);

	const profile = new ProfileController({ model: profileModel });
	const lobbies = new LobbiesController({ model: lobbiesModel, rooms });

	return {
		rooms,
		storage,
		controllers: { profile, lobbies },
	};
}

export type Services = ReturnType<typeof createServices>;
