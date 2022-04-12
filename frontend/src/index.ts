import axios from 'axios'
axios.defaults.baseURL = window.location.protocol + '//' + window.location.hostname + ':3000';

async function startGame(username: string) {
	try {
		const res = await axios.post('/api/game', {username});
		const {gameId, playerId} = res.data
		sessionStorage.setItem('gameId', gameId);
		sessionStorage.setItem('playerId', playerId);
		sessionStorage.setItem('username', username);
	} catch (e: any) {
		throw ensureIsError(e);
	}
}

async function joinGame(id: string, username: string) {
	try {
		const res = await axios.put('/api/game', {id, username});
		sessionStorage.setItem('gameId', id);
		sessionStorage.setItem('playerId', res.data.id);
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

export default {
	startGame,
	joinGame
}