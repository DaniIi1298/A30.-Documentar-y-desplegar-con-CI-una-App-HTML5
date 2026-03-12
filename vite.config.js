import { defineConfig } from 'vite'

export default defineConfig({
	base: '/A30.-Documentar-y-desplegar-con-CI-una-App-HTML5/',
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	build: {
		sourcemap: false,
		minify: 'esbuild',
		chunkSizeWarningLimit: 2000,
	},
})
