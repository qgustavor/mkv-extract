/** @type {import('./$types').EntryGenerator} */
const languages = import.meta.glob('$lib/translations/*.toml', {
  import: 'default'
})
export function entries () {
	return Object.keys(languages).map(filename => ({
		lang: filename.slice(22).replace('.toml', '')
	}))
}

export const prerender = true
