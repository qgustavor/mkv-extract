import { sveltekit } from '@sveltejs/kit/vite'
import { ViteToml } from 'vite-plugin-toml'
import path from 'path'
import type { UserConfig } from 'vite'

const config: UserConfig = {
	plugins: [sveltekit(), ViteToml()],
  resolve: {
    alias: {
      '/~': path.resolve(__dirname, 'src')
    }
  }
}

export default config
