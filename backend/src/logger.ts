import Action from '@plyb/web-game-core-shared/src/actions/Action';
import fs from 'fs'
import Game from './model/game'
function getLogLocation(game: Game) {
    return `./logs/${game.id}`;
}

export function logAction(game: Game, actionType: string, actionArgs: any) {
    log(game, `${actionType} executed with params ${actionArgs}`);
}

export function log(game: Game, content: string) {
    fs.writeFile(getLogLocation(game), Date.now() + ': ' + content + '\n', { flag: 'a' }, (err) => {
        if (err) {
            console.log('Logging error: ' + err);
        }
    });
}