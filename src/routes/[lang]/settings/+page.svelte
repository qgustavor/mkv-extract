<script>
  import { preferences, resetPreferences } from '/~/utils/stores'
  import { t } from '$lib/translations'

  import {
    Form, FormGroup, Grid, Row, Column,
    Select, SelectItem,
    TextInput, Button,
    ToastNotification,
    UnorderedList,
    ListItem
  } from 'carbon-components-svelte'
</script>

<svelte:head>
  <title>{$t('main.name')} - {$t('settings.title')}</title>
  <meta name="description" content={$t('settings.description')}>
</svelte:head>

<Grid>
  <Row>
    <Column>
      <h1>{$t('settings.title')}</h1>

      <Form>
        <Row>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-subtitles" labelText={$t('settings.subtitle_extraction_mode')} bind:selected={$preferences.subtitleMode}>
                <SelectItem value="all" text={$t('settings.all_subtitles')} />
                <SelectItem value="lang" text={$t('settings.lang_subtitles')} />
                <SelectItem value="skip" text={$t('settings.skip_subtitles')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="subtitle-languages"
                labelText={$t('settings.subtitle_languages')}
                helperText={
                  $preferences.subtitleMode === 'lang'
                    ? $t('settings.subtitle_languages_helper')
                    : ''
                }
                bind:value={$preferences.subtitleLanguages}
                disabled={$preferences.subtitleMode !== 'lang'}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-attachments" labelText={$t('settings.attachment_extraction_mode')} bind:selected={$preferences.attachmentMode}>
                <SelectItem value="all" text={$t('settings.all_attachments')} />
                <SelectItem value="skip" text={$t('settings.skip_attachments')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-metadata" labelText={$t('settings.metadata_extraction_mode')} bind:selected={$preferences.metadataMode}>
                <SelectItem value="json" text={$t('settings.json_metadata')} />
                <SelectItem value="skip" text={$t('settings.skip_metadata')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-video" labelText={$t('settings.video_extraction_mode')} bind:selected={$preferences.videoMode}>
                <SelectItem value="all" text={$t('settings.all_video')} />
                <SelectItem value="skip" text={$t('settings.skip_video')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-audio" labelText={$t('settings.audio_extraction_mode')} bind:selected={$preferences.audioMode}>
                <SelectItem value="all" text={$t('settings.all_audio')} />
                <SelectItem value="skip" text={$t('settings.skip_audio')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-subtitle"
                labelText={$t('settings.subtitle_file_template')}
                bind:value={$preferences.subtitleFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-attachment"
                labelText={$t('settings.attachment_file_template')}
                bind:value={$preferences.attachmentFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-metadata"
                labelText={$t('settings.metadata_file_template')}
                bind:value={$preferences.metadataFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-video"
                labelText={$t('settings.video_file_template')}
                bind:value={$preferences.videoFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-audio"
                labelText={$t('settings.audio_file_template')}
                bind:value={$preferences.audioFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="collision-mode" labelText={$t('settings.file_collision_mode')} bind:selected={$preferences.collisionMode}>
                <SelectItem value="rename" text={$t('settings.rename_files')} />
                <SelectItem value="skip" text={$t('settings.skip_collisions')} />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <Button kind="secondary" on:click={resetPreferences} class="mt-2">{$t('settings.reset_options')}</Button>
          </Column>
        </Row>
      </Form>

      <ToastNotification
        fullWidth
        hideCloseButton
        lowContrast
        kind="info"
        title={$t('settings.info')}
        subtitle={$t('settings.stream_containers_info')}
        class="mt-2"
      />

      <ToastNotification
        fullWidth
        hideCloseButton
        lowContrast
        kind="info"
        title={$t('settings.file_format_placeholders_title')}
        class="mt-2"
      >
        <UnorderedList nested slot="subtitle">
          <ListItem><code>Filename</code>: {$t('settings.filename_placeholder')}</ListItem>
          <ListItem><code>FilenameNoExt</code>: {$t('settings.filename_no_ext_placeholder')}</ListItem>
          <ListItem><code>TrackName</code>: {$t('settings.track_name_placeholder')}</ListItem>
          <ListItem><code>TrackNumber</code>: {$t('settings.track_number_placeholder')}</ListItem>
          <ListItem><code>Language</code>: {$t('settings.language_placeholder')}</ListItem>
          <ListItem><code>AttachmentFilename</code>: {$t('settings.attachment_filename_placeholder')}</ListItem>
          <ListItem>{$t('settings.folder_creation_placeholder')}</ListItem>
        </UnorderedList>
      </ToastNotification>
    </Column>
  </Row>
</Grid>
