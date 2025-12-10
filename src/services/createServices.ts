import PlayersModel from '~/model/PlayersModel';
import LobbiesModel from '~/model/LobbiesModel';
import PlayersController from '~/controllers/PlayersController';
import LobbiesController from '~/controllers/LobbiesController';
import AuthModel from '~/model/AuthModel';
import AuthController from '~/controllers/AuthController';

export type Services = {
	models: {
		auth: AuthModel;
		players: PlayersModel;
		lobbies: LobbiesModel;
	};
	controllers: {
		auth: AuthController;
		players: PlayersController;
		lobbies: LobbiesController;
	};
};

export function createServices(): Services {
	const authModel = new AuthModel();
	const playersModel = new PlayersModel();
	const lobbiesModel = new LobbiesModel();

	const auth = new AuthController({ model: authModel });
	const players = new PlayersController({ playersModel, authModel });
	const lobbies = new LobbiesController({ model: lobbiesModel });

	return {
		models: { auth: authModel, players: playersModel, lobbies: lobbiesModel },
		controllers: { auth, players, lobbies },
	};
}