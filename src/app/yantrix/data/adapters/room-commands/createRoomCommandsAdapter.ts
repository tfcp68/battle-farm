import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/shared/services/createServices';
import { RoomCommandsDataSource } from './RoomCommandsDataSource';
import { RoomCommandsDataDestination } from './RoomCommandsDataDestination';

export interface RoomCommandsAdapter {
	source: RoomCommandsDataSource;
	destination: RoomCommandsDataDestination;
}

/** Pairs the room-commands destination with the source that publishes its result. */
export function createRoomCommandsAdapter(opts: {
	services: Services;
	queryClient: QueryClient;
}): RoomCommandsAdapter {
	const source = new RoomCommandsDataSource();
	const destination = new RoomCommandsDataDestination({
		services: opts.services,
		queryClient: opts.queryClient,
		onResolved: (result) => source.push(result),
	});
	return { source, destination };
}
