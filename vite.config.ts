import { resolve } from "path"
import { defineConfig } from "vite";
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/main.ts"),
			formats: ["es", "cjs"],
			fileName: "index"
		}
	},
	plugins: [dts({ rollupTypes: true })]
})