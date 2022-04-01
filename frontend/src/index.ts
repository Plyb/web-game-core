import axios from 'axios'
axios.defaults.baseURL = window.location.protocol + '//' + window.location.hostname + ':3000';

// function setCookie(cname, cvalue, exdays) {
// 	const d = new Date();
// 	d.setTime(d.getTime() + (exdays*24*60*60*1000));
// 	let expires = "expires="+ d.toUTCString();
// 	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
// }

// function getCookie(cname) {
// 	let name = cname + "=";
// 	let decodedCookie = decodeURIComponent(document.cookie);
// 	let ca = decodedCookie.split(';');
// 	for(let i = 0; i <ca.length; i++) {
// 		let c = ca[i];
// 		while (c.charAt(0) == ' ') {
// 			c = c.substring(1);
// 		}
// 		if (c.indexOf(name) == 0) {
// 			return c.substring(name.length, c.length);
// 		}
// 	}
// 	return "";
// }

async function startGame(username: string) {
	const res = await axios.post('/api/game', {username});
	const {gameId, playerId} = res.data
	sessionStorage.setItem('gameId', gameId);
	sessionStorage.setItem('playerId', playerId);
	sessionStorage.setItem('username', username);
}

async function joinGame(id: string, username: string) {
	const res = await axios.put('/api/game', {id, username});
	sessionStorage.setItem('gameId', id);
	sessionStorage.setItem('playerId', res.data.id);
	sessionStorage.setItem('username', username);
	console.log("joined " + id);
}

export default {
	startGame,
	joinGame
}