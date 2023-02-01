<script>
  import { page } from '$app/stores'
  import { base } from '$app/paths'
  import Light from 'carbon-icons-svelte/lib/Light.svelte'
  import Download from 'carbon-icons-svelte/lib/Download.svelte'
  import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte'
  import {
    Theme, Header, HeaderUtilities, HeaderGlobalAction, HeaderActionLink,
    HeaderNav, HeaderNavItem, TooltipDefinition, SkipToContent,
    SideNav, SideNavItems, SideNavLink
  } from 'carbon-components-svelte'

  let theme = 'g90'
  function changeTheme () {
    theme = theme === 'white' ? 'g90' : 'white'
  }
  
  let isSideNavOpen = false
  const routes = [
    [base + '/', 'Home page'],
    [base + '/settings', 'Settings'],
    [base + '/help', 'Help'],
    [base + '/classic/index.html', 'Classic', true]
  ]
</script>

<Theme bind:theme persist persistKey="mkvextract-theme" />

<Header platformName="MKV Extract" bind:isSideNavOpen expandedByDefault={false}>
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
    <TooltipDefinition tooltipText="Change color scheme" align="end">
      <HeaderGlobalAction aria-label="Change color scheme" icon={Light} on:click={changeTheme} />
    </TooltipDefinition>
    <TooltipDefinition tooltipText="Check the original mkvextract" align="end">
      <HeaderActionLink aria-label="Download page" icon={Download} href="https://mkvtoolnix.download/" />
    </TooltipDefinition>
    <TooltipDefinition tooltipText="Check project on GitHub" align="end">
      <HeaderActionLink aria-label="GitHub page" icon={LogoGithub} href="https://github.com/qgustavor/mkv-extract/" />
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
