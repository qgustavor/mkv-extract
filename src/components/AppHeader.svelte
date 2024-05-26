<script>
  import { page } from '$app/stores'
  import { base } from '$app/paths'
  import Light from 'carbon-icons-svelte/lib/Light.svelte'
  import Download from 'carbon-icons-svelte/lib/Download.svelte'
  import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte'
  import IbmWatsonLanguageTranslator from 'carbon-icons-svelte/lib/IbmWatsonLanguageTranslator.svelte'
  import {
    Theme, Header, HeaderUtilities, HeaderGlobalAction, HeaderActionLink,
    HeaderNav, HeaderNavItem, TooltipDefinition, SkipToContent,
    SideNav, SideNavItems, SideNavLink, OverflowMenu, OverflowMenuItem
  } from 'carbon-components-svelte'

  import { t, locale, locales } from '$lib/translations'
  import { goto } from '$app/navigation'
  $: ({ route } = $page.data)
  
  function changeLocale (locale) {
    window.location = `./${locale}${route}`
  }

  let theme = 'g90'
  function changeTheme () {
    theme = theme === 'white' ? 'g90' : 'white'
  }

  let isSideNavOpen = false
  const localeCode = locale.get()
  const routes = [
    [base + '/' + localeCode + '/', $t('header.home-page')],
    [base + '/' + localeCode + '/settings', $t('header.settings')],
    [base + '/' + localeCode + '/help', $t('header.help')],
    [base + '/classic/index.html', $t('header.classic'), true]
  ]
</script>

<Theme bind:theme persist persistKey="mkvextract-theme" />

<Header platformName={$t('main.name')} bind:isSideNavOpen expandedByDefault={false}>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>

  <HeaderNav>
    {#each routes as [href, text, external]}
      <HeaderNavItem
        isSelected={$page.route.id === href}
        target={external ? '_blank' : ''}
        {href}
        {text}
      />
    {/each}
  </HeaderNav>

  <HeaderUtilities>
    <OverflowMenu style="width: auto" flipped class="bx--header__action">
      <HeaderGlobalAction
        slot="menu"
        aria-label={$t('header.locale')}
        iconDescription={$t('header.locale')}
        icon={IbmWatsonLanguageTranslator}
      />
      {#each $locales as lc}
        <OverflowMenuItem
          text={$t('locales.' + lc)}
          on:click={() => changeLocale(lc)}
          disabled={lc === $locale}
        />
      {/each}
    </OverflowMenu>
    <TooltipDefinition tooltipText={$t('header.color-scheme')} align="end">
      <HeaderGlobalAction aria-label={$t('header.color-scheme')} icon={Light} on:click={changeTheme} isActive />
    </TooltipDefinition>
    <TooltipDefinition tooltipText={$t('header.download')} align="end">
      <HeaderActionLink aria-label={$t('header.download')} icon={Download} href="https://mkvtoolnix.download/" />
    </TooltipDefinition>
    <TooltipDefinition tooltipText={$t('header.github')} align="end">
      <HeaderActionLink aria-label={$t('header.github')} icon={LogoGithub} href="https://github.com/qgustavor/mkv-extract/" />
    </TooltipDefinition>
  </HeaderUtilities>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    {#each routes as [href, text, external]}
      <SideNavLink
        isSelected={$page.route.id === href}
        target={external ? '_blank' : ''}
        on:click={() => isSideNavOpen = false}
        {href}
        {text}
      />
    {/each}
  </SideNavItems>
</SideNav>
