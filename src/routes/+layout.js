import { setLocale, setRoute } from '$lib/translations'

export const prerender = true
export const trailingSlash = true

/** @type { import('@sveltejs/kit').Load } */
export const load = async ({ url, params }) => {
  const { pathname } = url

  const lang = params.lang ?? (pathname.match(/\/(en|pt)\//)?.[0] || 'en')
  const route = pathname.replace(new RegExp(`/${lang}/`), '/')

  await setLocale(lang)
  await setRoute(route)

  return { route, lang }
}
