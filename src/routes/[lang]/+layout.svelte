<script>
  import 'carbon-components-svelte/css/all.css'
  import '/~/style.css'

  import { Content, ToastNotification } from 'carbon-components-svelte'
  import AppHeader from '/~/components/AppHeader.svelte'
  import { ProgressBar } from '@prgm/sveltekit-progress-bar'
</script>

<ProgressBar color="#0f62fe" zIndex={9000} />

<AppHeader />

<Content class="main-content">
  <noscript>
    <ToastNotification fullWidth hideCloseButton>
      <p slot="subtitle">This web application requires JavaScript to work. If you prefer not using JavaScript then download the original mkvextract here: <a href="https://mkvtoolnix.download/">https://mkvtoolnix.download/</a></p>
    </ToastNotification>
  </noscript>

  <slot></slot>
</Content>
