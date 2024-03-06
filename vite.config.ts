import { resolve } from "path"
import { defineConfig } from "vite"

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Vanguard",
			fileName: `vanguard-client`,
		},
		rollupOptions: {
			external: ["vue", "@inertiajs/vue3", "@vueuse/core", "query-string"],
		},
	},
})