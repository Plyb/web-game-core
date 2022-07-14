import WebSocketAsPromised from 'websocket-as-promised';
import SocketListener from './socketListener';

let socket: WebSocketAsPromised;

export async function sendRequest(path: string, body?: any) {
	const response = await socket.sendRequest({
		path,
		body
	});
	if (response?.error) {
		throw new WebsocketResponseError(response.body);
	}
	return response;
}

async function startGame(username: string) {
	await connectToGame(username);
}

async function joinGame(id: string, username: string) {
	await connectToGame(username, id);
}

export function setSocketListener(listener: SocketListener) {
	socket.onMessage.removeAllListeners();
	socket.onMessage.addListener(listener.getWebsocketAsPromisedListener());
}

async function connectToGame(username: string, gameId?: string) {
	const newGame = !gameId;
	try {
		const params = new URLSearchParams();
		params.append('username', username);
		params.append('newGame', newGame.toString());
		params.append('gameId', gameId || '');

		socket = new WebSocketAsPromised('ws://' + window.location.host + '/api?' + params , {
			packMessage: data => JSON.stringify(data),
			unpackMessage: data => JSON.parse(data.toString()),
			attachRequestId: (data, id) => Object.assign({id}, data), // attach requestId to message as `id` field
  			extractRequestId: data => data?.id, 
		});
		await socket.open();
		const res = await sendRequest('/api/game/get-game-info');
		const {gameId: newGameId, userId} = res.body;
		sessionStorage.setItem('gameId', newGameId);
		sessionStorage.setItem('userId', userId);
		sessionStorage.setItem('username', username);
	} catch (e: any) {
		throw ensureIsError(e);
	}
}

export async function reconnect() {
	const params = new URLSearchParams();
	params.append('userId', getUserId() || '');
    params.append('gameId', getGameId() || '');
	socket = new WebSocketAsPromised('ws://' + window.location.host + '/api/reconnect?' + params, {
		packMessage: data => JSON.stringify(data),
		unpackMessage: data => JSON.parse(data.toString()),
		attachRequestId: (data, id) => Object.assign({id}, data), // attach requestId to message as `id` field
		  extractRequestId: data => data?.id, 
	});
	await socket.open();
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

export default {
	startGame,
	joinGame,
	getGameId,
	getUsername,
	getUserId,
}

class WebsocketResponseError extends Error {
	name = 'WebsocketResponseError';
}