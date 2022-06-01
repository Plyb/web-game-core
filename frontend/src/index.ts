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

export function setUpVueApp(customApp?: DefineComponent) {

	type TaggedElement = Element & {
		eventMap: {
			[key: string]: (event: MouseEvent) => void
		}
	}
	function createMouseOutsideDirective(eventType: 'mouseup' | 'click' | 'touchend') {
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