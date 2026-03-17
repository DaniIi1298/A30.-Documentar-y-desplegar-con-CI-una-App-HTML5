import './style.css'

import { Bugfender } from '@bugfender/sdk'
import { AUTO, Game } from 'phaser'
import PlayScene from './scenes/playScene.js'
import WaitingRoom from './scenes/waitingRoom.js'

Bugfender.init({
	appKey: 'ir97Bp0TheMUejmBCryIj8fwwyMQxqCw',
	// overrideConsoleMethods: true,
	// printToConsole: true,
	// registerErrorHandler: true,
	// logBrowserEvents: true,
	// logUIEvents: true,
	// version: '',
	// build: '',
})

/** @type { import ('phaser').Types.Core.GameConfig  } **/
const gameConfig = {
	type: AUTO,
	parent: 'game-container',
	width: 288,
	height: 403,
	backgroundColor: '#049cd8',
	scene: [WaitingRoom, PlayScene],
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 },
			debug: false,
		},
	},
}

function initializeGame() {
	return new Game(gameConfig)
}

initializeGame()
