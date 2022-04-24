import axios from 'axios'
import Lobby from './lobby';
import { Board, Piece, PieceLocation, Player } from '@plyb/web-game-core-shared';
import BoardGameStateProxy from './BoardGameStateProxy';
import { ShapeSpace } from '@plyb/web-game-core-shared/src/model/gameState/Piece';
axios.defaults.baseURL = window.location.protocol + '//' + window.location.hostname + ':3000';

async function startGame(username: string) {
	try {
		const res = await axios.post('/api/game', {username});
		const {gameId, playerId} = res.data
		sessionStorage.setItem('gameId', gameId);
		sessionStorage.setItem('userId', playerId);
		sessionStorage.setItem('username', username);
	} catch (e: any) {
		throw ensureIsError(e);
	}
}

async function joinGame(id: string, username: string) {
	try {
		const res = await axios.put('/api/game', {id, username});
		sessionStorage.setItem('gameId', id);
		sessionStorage.setItem('userId', res.data.id);
		sessionStorage.setItem('username', username);
		console.log("joined " + id);
	} catch (e: any) {
		throw ensureIsError(e);
	}
}

function ensureIsError(e: any): Error {
	if (typeof e === 'string') {
		return new Error(e);
	} else if (e instanceof Error) {
		return e
	} else {
		return new Error("unknown error type");
	}
}

function getGameId(): string | null {
	return sessionStorage.getItem('gameId');
}

function getUsername(): string | null {
	return sessionStorage.getItem('username');
}

function getUserId(): string | null {
	return sessionStorage.getItem('userId');
}

export {
	Board,
	Piece,
	PieceLocation,
	BoardGameStateProxy,
	Player,
	ShapeSpace,
	Lobby,
};

export default {
	startGame,
	joinGame,
	getGameId,
	getUsername,
	getUserId,
}