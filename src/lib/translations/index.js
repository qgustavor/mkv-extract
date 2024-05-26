import I18nBase from '@sveltekit-i18n/base'
import parser from '@sveltekit-i18n/parser-icu'

const i18n = new I18nBase({
  fallbackLocale: 'en',
  parser: parser(),
  loaders: [
    {
      locale: 'en',
      key: '',
      loader: () => import('./en.toml').then(e => e.default)
    },
    {
      locale: 'pt',
      key: '',
      loader: () => import('./pt.toml').then(e => e.default)
    }
  ]
})

export const defaultLocale = 'en'

export const { t, locale, locales, loading, setLocale, setRoute, translations } = i18n
