import PlayersModel from '~/model/PlayersModel';
import LobbiesModel from '~/model/LobbiesModel';
import PlayersController from '~/controllers/PlayersController';
import LobbiesController from '~/controllers/LobbiesController';
import AuthModel from '~/model/AuthModel';
import AuthController from '~/controllers/AuthController';
import GameModel from '~/model/GameModel';
import GameController from '~/controllers/GameController';

export type Services = {
	models: {
		auth: AuthModel;
		players: PlayersModel;
		lobbies: LobbiesModel;
		games: GameModel;
	};
	controllers: {
		auth: AuthController;
		players: PlayersController;
		lobbies: LobbiesController;
		games: GameController;
	};
};

export function createServices(): Services {
	const authModel = new AuthModel();
	const playersModel = new PlayersModel();
	const lobbiesModel = new LobbiesModel();
	const gamesModel = new GameModel();

	const auth = new AuthController({ model: authModel });
	const players = new PlayersController({ playersModel, authModel });
	const lobbies = new LobbiesController({ model: lobbiesModel });
	const games = new GameController({ model: gamesModel });

	return {
		models: { auth: authModel, players: playersModel, lobbies: lobbiesModel, games: gamesModel },
		controllers: { auth, players, lobbies, games },
	};
}