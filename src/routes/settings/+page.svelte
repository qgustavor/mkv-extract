<script>
  import { preferences, resetPreferences } from '/~/utils/stores'
  
  import {
    Form, FormGroup, Grid, Row, Column,
    Select, SelectItem,
    TextInput, Button,
    ToastNotification,
    UnorderedList,
    ListItem
  } from 'carbon-components-svelte'
</script>

<Grid>
  <Row>
    <Column>
      <h1>Settings</h1>
    
      <Form>
        <Row>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-subtitles" labelText="Subtitle extraction mode" bind:selected={$preferences.subtitleMode}>
                <SelectItem value="all" text="Extract all subtitles" />
                <SelectItem value="lang" text="Extract subtitles by language" />
                <SelectItem value="skip" text="Skip subtitles" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="subtitle-languages"
                labelText="Filtered subtitle languages"
                helperText={
                  $preferences.subtitleMode === 'lang'
                    ? 'Enter 3-letter language codes separated by space (e.g.: eng, cmn, hin, spa, fra)'
                    : ''
                }
                bind:value={$preferences.subtitleLanguages}
                disabled={$preferences.subtitleMode !== 'lang'}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-attachments" labelText="Attachment extraction mode" bind:selected={$preferences.attachmentMode}>
                <SelectItem value="all" text="Extract all attachments" />
                <SelectItem value="skip" text="Skip attachments" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-metadata" labelText="Metadata extraction mode" bind:selected={$preferences.metadataMode}>
                <SelectItem value="json" text="Extract metadata in a .json file" />
                <SelectItem value="skip" text="Skip metadata" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-video" labelText="Video extraction mode" bind:selected={$preferences.videoMode}>
                <SelectItem value="all" text="Extract videos" />
                <SelectItem value="skip" text="Skip video" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="select-audio" labelText="Audio extraction mode" bind:selected={$preferences.audioMode}>
                <SelectItem value="all" text="Extract all audio tracks" />
                <SelectItem value="skip" text="Skip audio" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-subtitle"
                labelText="Subtitle file template"
                bind:value={$preferences.subtitleFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-attachment"
                labelText="Attachment file template"
                bind:value={$preferences.attachmentFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-metadata"
                labelText="Metadata file template"
                bind:value={$preferences.metadataFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-video"
                labelText="Video file template"
                bind:value={$preferences.videoFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <TextInput
                id="file-format-audio"
                labelText="Audio file template"
                bind:value={$preferences.audioFile}
              />
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <FormGroup noMargin>
              <Select id="collision-mode" labelText="File collision mode" bind:selected={$preferences.collisionMode}>
                <SelectItem value="rename" text="Rename colliding files" />
                <SelectItem value="skip" text="Skip colliding files" />
              </Select>
            </FormGroup>
          </Column>
          <Column sm={12} md={12} lg={8}>
            <Button kind="secondary" on:click={resetPreferences} class="mt-2">Restore default options</Button>
          </Column>
        </Row>
      </Form>
      
      <ToastNotification
        fullWidth
        hideCloseButton
        lowContrast
        kind="info"
        title="Info"
        subtitle="Streams will be extracted using their own container where possible, otherwise it will attempt using a single stream MP4/M4A container, otherwise it will use a single stream MKV/MKA container."
        class="mt-2"
      />
      
      <ToastNotification
        fullWidth
        hideCloseButton
        lowContrast
        kind="info"
        title="Supported file format placeholders"
        class="mt-2"
      >
        <UnorderedList nested slot="subtitle">
          <ListItem><code>Filename</code>: file name</ListItem>
          <ListItem><code>FilenameNoExt</code>: file name without extension</ListItem>
          <ListItem><code>TrackName</code>: track name</ListItem>
          <ListItem><code>TrackNumber</code>: track number</ListItem>
          <ListItem><code>Language</code>: track language (3 letter code)</ListItem>
          <ListItem><code>AttachmentFilename</code>: attachment filename</ListItem>
          <ListItem>You can use <code>/</code> to create folders</ListItem>
        </UnorderedList>
      </ToastNotification>
    </Column>
  </Row>
</Grid>
