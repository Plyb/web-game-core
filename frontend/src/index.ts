import 'reflect-metadata'; 
import '@plyb/web-game-core-shared/src/model/gameState/pieces/defaultPieceTypes';
import Vue, { createApp, DefineComponent } from 'vue'
import router from './router/index'
import App from './App.vue';

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