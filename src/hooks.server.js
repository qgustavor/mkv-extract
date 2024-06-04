import { defaultLocale, locales, setLocale, setRoute } from '$lib/translations'
import { base } from '$app/paths'

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
  const { url, request } = event
  const pathname = url.pathname.slice(base.length)

  // Get defined locales
  const supportedLocales = locales.get().map(l => l.toLowerCase())

  // Try to get locale from `pathname`.
  let locale = supportedLocales.find((l) => l === `${pathname.match(/[^/]+?(?=\/|$)/)}`.toLowerCase())

  // If route locale is not supported
  if (!locale) {
    // Return redirect page
    return resolve(event)
  }

  // Add html `lang` attribute
  const localeInfo = new Intl.Locale(locale)
  const { direction } = localeInfo.textInfo
  return resolve({ ...event, locals: { lang: locale } }, {
    transformPageChunk: ({ html }) => html.replace(/<html.*>/, `<html lang="${locale}" dir="${direction}">`),
  })
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export const handleError = async ({ event }) => {
  const { locals } = event
  const { lang } = locals

  await setLocale(lang)
  await setRoute('error')

  return locals
}