import I18nBase from '@sveltekit-i18n/base'
import parser from '@sveltekit-i18n/parser-icu'

const languages = import.meta.glob('./*.toml', {
  import: 'default'
})
const i18n = new I18nBase({
  fallbackLocale: 'en',
  parser: parser(),
  loaders: Object.entries(languages).map(entry => ({
    locale: entry[0].slice(2).replace('.toml', ''),
    loader: entry[1],
    key: ''
  }))
})

export const defaultLocale = 'en'

export const { t, locale, locales, loading, setLocale, setRoute, translations } = i18n
