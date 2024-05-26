<script>
  import { Grid, Row, Column, Link } from 'carbon-components-svelte'
  import { t } from '$lib/translations'
</script>

<Grid>
  <Row>
    <Column>
      <h1>{$t('help.title')}</h1>
      
      <p>{$t('help.description_part1')} <Link inline href="https://github.com/qgustavor/ffmpeg.js">{$t('help.description_link_text')}</Link> {$t('help.description_part2')}</p>
      
      <p>{$t('help.experiment_description')}</p>
      
      <p>{$t('help.abandoned_project_note')}</p>
      
      <h2>{$t('faq.title')}</h2>
      
      <dl>
        <dt>{$t('faq.why_javascript')}</dt>
        <dd>{$t('faq.javascript_explanation')}</dd>

        <dt>{$t('faq.why_no_url')}</dt>
        <dd>{$t('faq.no_url_explanation_part1')}<Link inline href="https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy">{$t('faq.no_url_explanation_link_text')}</Link>{$t('faq.no_url_explanation_part2')}</dd>

        <dt>{$t('faq.why_not_working')}</dt>
        <dd>{$t('faq.not_working_explanation')}</dd>

        <dt>{$t('faq.why_mp4_mkv')}</dt>
        <dd>{$t('faq.mp4_mkv_explanation')}</dd>

        <dt>{$t('faq.why_not_downloads')}</dt>
        <dd>{$t('faq.not_downloads_explanation_part1')}<Link inline href="https://en.wikipedia.org/wiki/Filename#Comparison_of_filename_limitations">{$t('faq.not_downloads_explanation_link_text')}</Link>{$t('faq.not_downloads_explanation_part2')}</dd>

        <dt>{$t('faq.why_ffmpeg')}</dt>
        <dd>{$t('faq.ffmpeg_explanation')}</dd>

        <dt>{$t('faq.why_svelte')}</dt>
        <dd>{$t('faq.svelte_explanation')}</dd>

        <dt>{$t('faq.why_corporate')}</dt>
        <dd>{$t('faq.corporate_explanation')}</dd>
      </dl>
    </Column>
  </Row>
</Grid>

<style>
dt {
  font-weight: bold;
  margin-top: 1em;
  margin-bottom: 0.4em;
}
dl, dd {
  font-size: 1rem;
  padding-left: 1em;
}
p {
  margin-bottom: 1em;
}
</style>
