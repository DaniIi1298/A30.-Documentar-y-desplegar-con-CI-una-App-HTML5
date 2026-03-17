// PlayScene.js

import { Bugfender } from '@bugfender/sdk'
import { Scene } from 'phaser'
import Player from '../entity/player'
import Background from '../objects/background'
import Obstacles from '../objects/obstacles'

class PlayScene extends Scene {
	constructor() {
		super('PlayScene')
		this.cameraEffectTriggered = true
	}

	create() {
		// Estado inicial de la escena
		this.isGameOver = false

		// Log: la escena se ha iniciado (útil para agrupar por device/session)
		Bugfender.info('PlayScene iniciada')

		fetch('https://a26-generador-express.onrender.com/api/bicicletas')
			.then((response) => response.json())
			.then((data) => {
				console.log('Datos de la API:', data)

				if (data.length > 0) {
					const bici = data[0]

					this.add.text(20, 20, 'Bicicleta: ' + bici.nombre, {
						fontSize: '20px',
						fill: '#ffffff',
					})

					this.add.text(20, 50, 'Tipo: ' + bici.tipo, {
						fontSize: '20px',
						fill: '#ffffff',
					})
				}
			})
			.catch((error) => {
				Bugfender.error('Error al obtener datos de la API', {
					message: error.message,
					url: 'https://a26-generador-express.onrender.com/api/bicicletas',
				})

				console.error('Error al obtener datos:', error)
			})

		// Efecto de cámara controlado (solo la primera vez)
		if (this.cameraEffectTriggered) {
			this.cameraEffectTriggered = false
			this.hitSound = this.sound.add('hitSound')
			this.handleEffectCamera()
		}

		// Creación de elementos de la escena
		this.background = new Background(this)
		this.background.create()

		const { width, height } = this.sys.game.config
		this.player = new Player(this, width / 3, height / 2)

		// Efecto visual de entrada
		this.cameras.main.fadeIn(1000)

		// Input: teclado y puntero
		this.cursors = this.input.keyboard.createCursorKeys()

		// Log de interacción: guardamos coordenadas para contexto
		this.input.on('pointerdown', (pointer) => {
			Bugfender.log('Click del usuario', {
				x: pointer.x,
				y: pointer.y,
			})

			this.player.jump()
		})

		// Obstáculos y colisiones
		this.obstacles = new Obstacles(this)

		this.physics.add.collider(
			this.player,
			this.obstacles.obstaclesGroup,
			this.handleGameOver,
			null,
			this,
		)

		// --- Botón generador de errores (requisito de la práctica) ---
		// Lo añadimos aquí dentro para que 'this' esté disponible y sea parte de la escena
		const errorBtn = this.add
			.text(10, 100, 'ERROR', {
				backgroundColor: '#ff0000',
				color: '#ffffff',
				padding: { x: 8, y: 6 },
			})
			.setInteractive()

		// Error síncrono controlado
		errorBtn.on('pointerdown', () => {
			try {
				throw new Error('Error de prueba manual')
			} catch (err) {
				Bugfender.error('Error generado por botón (sync)', err)
			}
		})

		// Error asíncrono controlado (promesa rechazada)
		errorBtn.on('pointerup', async () => {
			try {
				// rechazamos intencionalmente para generar traza async
				await Promise.reject(new Error('Error async de prueba'))
			} catch (err) {
				Bugfender.error('Error generado por botón (async)', err)
			}
		})
		// -------------------------------------------------------------
	}

	update() {
		// Manejo de entrada por teclado (espacio) y límites fuera de pantalla
		if (this.cursors.space.isDown) this.player.jump()
		if (this.player.y > 344 || this.player.y < 0) this.handleGameOver()

		// Actualización de objetos
		this.background.update()
		this.obstacles.update()
	}

	handleEffectCamera() {
		// Fade out y restart para efecto de transición
		this.cameras.main.fadeOut(1000, 0, 0, 0, (_camera, progress) => {
			if (progress === 1) this.scene.start('PlayScene')
		})
	}

	handleGameOver() {
		// Evitamos manejar múltiples veces la finalización
		if (this.isGameOver) return
		this.isGameOver = true

		// Log de advertencia con contexto básico
		Bugfender.warn('Game Over', {
			playerY: this.player?.y,
			timestamp: new Date().toISOString(),
		})

		this.add.image(144, 150, 'gameOverImage').setScale(0.7, 0.5)
		this.hitSound.play()

		// Listeners para reinicio (teclado y táctil)
		document.addEventListener('keydown', this.handleSpacePress)
		document.addEventListener('touchstart', this.handleTouchStart)
		this.scene.pause()
	}

	handleSpacePress = (event) => {
		// Reinicia si se pulsa espacio
		if (event.key === ' ') {
			this.restartGame()
			document.removeEventListener('keydown', this.handleSpacePress)
		}
	}

	handleTouchStart = () => {
		// Reinicia en touch
		this.restartGame()
		document.removeEventListener('touchstart', this.handleTouchStart)
	}

	restartGame() {
		// Reinicializamos estado y reiniciamos la escena
		this.isGameOver = false
		this.scene.restart()
	}
}

export default PlayScene
