import BaseController from './BaseController';
import PlayersModel from '~/model/PlayersModel';
import AuthModel from '~/model/AuthModel';

export type PlayersControllerDeps = {
	playersModel: PlayersModel;
	authModel: AuthModel;
};

export default class PlayersController extends BaseController {
	private readonly players: PlayersModel;
	private readonly authModel: AuthModel;

	constructor({ playersModel, authModel }: PlayersControllerDeps) {
		super();
		this.players = playersModel;
		this.authModel = authModel;
	}

	
	
	async register(nickname: string) {
		
		return await this.players.create({ nickname });
	}

	async getById(playerId: string) {
		return this.players.getById(playerId);
	}

	async list(){
		return this.players.list();
	}

	async updateNickname(playerId: string, nickname: string) {
		return await this.players.update(playerId, { nickname });
	}

	async touchLastSeen(playerId: string, at: string = new Date().toISOString()){
		return await this.players.update(playerId, { lastSeen: at });
	}

	async delete(playerId: string): Promise<boolean> {
		return await this.players.delete(playerId);
	}

	
	
	async getCurrentPlayerId(): Promise<string> {
		const current = await this.authModel.getCurrentPlayer();
		if (!current) {
			throw new Error('No authenticated player');
		}
		return current.playerId;
	}
}