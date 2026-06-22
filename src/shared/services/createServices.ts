import AuthModel from '~/entities/auth/model';
import AuthController from '~/entities/auth/controller';
import PlayersModel from '~/entities/player/model';
import PlayersController from '~/entities/player/controller';
import LobbiesModel from '~/entities/lobby/model';
import LobbiesController from '~/entities/lobby/controller';
import GameModel from '~/entities/game/model';
import GameController from '~/entities/game/controller';

export function createServices() {
	const authModel = new AuthModel();
	const playersModel = new PlayersModel();
	const lobbiesModel = new LobbiesModel();
	const gameModel = new GameModel();

	const auth = new AuthController({ model: authModel });
	const players = new PlayersController({ playersModel, authModel });
	const lobbies = new LobbiesController({ model: lobbiesModel });
	const games = new GameController({ model: gameModel });

	return {
		controllers: { auth, players, lobbies, games },
	};
}

export type Services = ReturnType<typeof createServices>;
