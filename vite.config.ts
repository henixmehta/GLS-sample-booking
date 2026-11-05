import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	// 3001 is the main GLS website (sample feedback links point there)
	server: { host: true, port: 3002 },
	preview: { host: true, port: 3002 },
})
