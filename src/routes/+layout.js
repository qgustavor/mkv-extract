import { locale, setLocale, setRoute } from '$lib/translations'
import { browser, building, dev, version } from '$app/environment'

export const prerender = true
export const trailingSlash = true

/** @type { import('@sveltejs/kit').Load } */
export const load = async ({ url, params }) => {
  const { pathname } = url

  const lang = params.lang ?? 'en'
  const route = pathname.replace(new RegExp(`^(/mkv-extract)?/${lang}/?`), '/')

  if (!browser || !locale.get()) {
    await setLocale(lang)
    await setRoute(route)
  }

  return { route, lang }
}
