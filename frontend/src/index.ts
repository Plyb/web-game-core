import axios from 'axios'
import 'reflect-metadata'; 
import '@plyb/web-game-core-shared/src/model/gameState/pieces/defaultPieceTypes';
import Lobby from './lobby';
import { Board, Piece, PieceLocation, Player } from '@plyb/web-game-core-shared';
import BoardGameStateProxy from './BoardGameStateProxy';
import { ShapeSpace } from '@plyb/web-game-core-shared/src/model/gameState/pieces/Piece';
import Action from '@plyb/web-game-core-shared/src/actions/Action';
import { Vec2 } from '@plyb/web-game-core-shared/src/model/gameState/types';
import Vue, { createApp, DefineComponent } from 'vue'
import router from './router/index'
import App from './App.vue'
import WebSocketAsPromised from 'websocket-as-promised';

let socket: WebSocketAsPromised;
async function sendRequest(path: string, body: any) {
	return await socket.sendRequest({
		path,
		body
	});
}

async function startGame(username: string) {
	try {
		socket = new WebSocketAsPromised('ws://' + window.location.host + '/api?username=' + username + '&newGame=true' , {
			packMessage: data => JSON.stringify(data),
			unpackMessage: data => JSON.parse(data.toString()),
			attachRequestId: (data, id) => Object.assign({id}, data), // attach requestId to message as `id` field
  			extractRequestId: data => data?.id, 
		});
		await socket.open();
		const res = await sendRequest('/api/game', { username, newGame: true });
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
		const res = await sendRequest('/api/game', {id, username});
		sessionStorage.setItem('gameId', id.toLowerCase());
		sessionStorage.setItem('userId', res.data.playerId);
		sessionStorage.setItem('username', username);
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

export function setUpVueApp(customApp?: DefineComponent) {

	type TaggedElement = Element & {
		eventMap: {
			[key: string]: (event: MouseEvent) => void
		}
	}
	function createMouseOutsideDirective(eventType: 'mouseup' | 'click' | 'touchend' | 'contextmenu') {
		return {
			beforeMount: function (el: TaggedElement, binding: Vue.DirectiveBinding) {
				function clickOutsideEvent(event: MouseEvent | TouchEvent) {
					// here I check that click was outside the el and his children
					const target = (function() {
						if (event instanceof MouseEvent) {
							return event.target;
						} else {
							const touch = event.changedTouches[0];
							if (touch) {
								return document.elementFromPoint(touch.clientX, touch.clientY);
							}
						}
					})()
					if (window.document.contains(target as Node)
						&& !(el == target || el.contains(target as Node))) {
						// and if it did, call method provided in attribute value
						binding.value();
					}
				}
				if (!el.eventMap) {
					el.eventMap = {};
				}
				el.eventMap[eventType] = clickOutsideEvent;
				document.addEventListener(eventType, clickOutsideEvent)
			},
			unmounted: function (el: any) {
				document.removeEventListener(eventType, el.eventMap[eventType])
			},
		}
	}

	const app = customApp || createApp(App);
	app.directive('mouseup-outside', createMouseOutsideDirective('mouseup'));
	app.directive('touchend-outside', createMouseOutsideDirective('touchend'));
	app.directive('click-outside', createMouseOutsideDirective('click'));
	app.directive('right-click-outside', createMouseOutsideDirective('contextmenu'));
	app.use(router);
	app.mount('#app');

}

export {
	Board,
	Piece,
	PieceLocation,
	BoardGameStateProxy,
	Player,
	ShapeSpace,
	Lobby,
	Action,
	Vec2,
};

export default {
	startGame,
	joinGame,
	getGameId,
	getUsername,
	getUserId,
}