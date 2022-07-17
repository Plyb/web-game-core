import { SocketRouter } from "../socketServer";

const router = new SocketRouter();

router.message('/get-players', ({send, game}) => {
    send({
        players: game.getPlayerNames(),
        started: game.isStarted(),
    })
});

router.message('/remove-player', ({body, game, sendAll}) => {
    game.leave(body.username);
    sendAll('/lobby/player-left', {
        playerName: body.username
    });
})

export default router;