<script>
import { locales } from '$lib/translations'
const localesJson = JSON.stringify(locales.get())
const redirectScript = `<script>
let language = navigator.language
if (!${localesJson}.includes(language)) language = 'en'
location = '/mkv-extract/' + language + '/'
<\/script>`
</script>

<svelte:head>
  <title>Redirecting...</title>
  {@html redirectScript}
  <meta http-equiv="refresh" content="5; url=/mkv-extract/en/" />
</svelte:head>

<p>Redirecting...</p>
