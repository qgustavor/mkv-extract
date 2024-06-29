import { sveltekit } from '@sveltejs/kit/vite'
import { ViteToml } from 'vite-plugin-toml'
import path from 'path'
import type { UserConfig } from 'vite'
import purgecss from '@erbelion/vite-plugin-sveltekit-purgecss'

const config: UserConfig = {
	plugins: [sveltekit(), ViteToml(), purgecss()],
  resolve: {
    alias: {
      '/~': path.resolve(__dirname, 'src')
    }
  }
}

export default config
