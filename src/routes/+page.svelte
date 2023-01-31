<script>
  import { preferences } from '/~/utils/stores'
  import handleFile from '/~/utils/handle-file'
  import extractStreams from '/~/utils/extract-streams'

  import {
    Grid, Row, Column,
    FileUploaderDropContainer,
    FormGroup, Button,
    Accordion, AccordionItem,
    ContentSwitcher, Switch,
    Checkbox, CodeSnippet,
    TooltipDefinition,
    InlineLoading
  } from 'carbon-components-svelte'

  let files = []
  let fileStatuses = new WeakMap()
  let fileResults = new WeakMap()
  let fileExtractionErrors = new WeakMap()
  let pendingFiles = 0

  function handleFiles () {
    for (const file of files) {
      const currentState = fileStatuses.get(file)
      if (!currentState) fileStatuses.set(file, 'loading')

      // Do not use async/await, handleFile handles a queue using a mutex
      pendingFiles++
      handleFile(file, $preferences).then(result => {
        fileStatuses.set(file, result.error ? 'load-error' : 'loaded')
        fileResults.set(file, result)
        fileResults = fileResults
      }).catch(error => {
        fileStatuses.set(file, 'load-error')
      }).then(() => {
        fileStatuses = fileStatuses
        pendingFiles--

        if (pendingFiles === 0 && !$preferences.manualMode) {
          const canStartExtraction = files.some(file => {
            return fileStatuses.get(file) === 'loaded' &&
              fileResults.get(file)?.parsed?.streams?.some(e => e.selected)
          })
          if (canStartExtraction) {
            startZipExtraction()
          } else {
            $preferences.manualMode = 1
          }
        }
      })
    }

    fileStatuses = fileStatuses
  }

  async function startFolderExtraction () {
    const rootFolderHandle = await window.showDirectoryPicker({ mode: 'readwrite' })

    // Chromium for some reason considers ~ to be an unsafe character (or at least used to consider)
    const {default: filenamify} = await import('filenamify/browser')
    const sanitize = filename => filenamify(filename).replaceAll('~', '')
    const { collisionMode } = $preferences

    return handleExtraction({
      async enqueue (filePath, contents) {
        const parts = filePath.split('/')
        let folderHandle = rootFolderHandle
        while (parts.length > 1) {
          folderHandle = await folderHandle.getDirectoryHandle(sanitize(parts.shift()), { create: true })
        }
        let name = sanitize(parts[0])
        const existentNames = []
        for await (const name of folderHandle.keys()) existentNames.push(name)
        if (existentNames.includes(name)) {
          if (collisionMode === 'skip') return
          let renameIndex = 2
          while (true) {
            const newName = name.replace(/(\.[^.]+)$/, ` (${renameIndex}) $1`)
            if (!existentNames.includes(newName)) {
              name = newName
              break
            }
            renameIndex++
          }
        }
        const fileHandle = await folderHandle.getFileHandle(name, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(contents)
        await writable.close()
      },
      close () {}
    })
  }

  async function startZipExtraction () {
    const {createZipWriter} = await import('/~/utils/zip-stream')
    const {default: streamSaver} = await import('streamsaver')

    let zipController
    const zipStream = createZipWriter({
      start (controller) {
        zipController = controller
      }
    })

    const namePrefix = files.length === 1
      ? files[0].name
      : new Date().toISOString().slice(0, 19).replace('T', ' ').replace(/[^\d ]+/g, '-')
    const zipName = `${namePrefix}-extraction.zip`
    const fileStream = streamSaver.createWriteStream(zipName)

    if (window.WritableStream && zipStream.pipeTo) {
      zipStream.pipeTo(fileStream).then(() => console.log('done writing'))
    } else {
      const writer = fileStream.getWriter()
      const reader = zipStream.getReader()
      const pump = () => reader.read().then(res => res.done ? writer.close() : writer.write(res.value).then(pump))
      pump()
    }

    const extractedFiles = []
    const { collisionMode } = $preferences
    return handleExtraction({
      enqueue (name, contents) {
        if (extractedFiles.includes(name)) {
          if (collisionMode === 'skip') return
          let renameIndex = 2
          while (true) {
            const newName = name.replace(/(\.[^.]+)$/, ` (${renameIndex}) $1`)
            if (!extractedFiles.includes(newName)) {
              name = newName
              break
            }
            renameIndex++
          }
        }
        extractedFiles.push(name)
        return zipController.enqueue(new File([contents], name))
      },
      close () {
        return zipController.close()
      }
    })
  }

  async function handleExtraction (controller) {
    pendingFiles = files.length
    for (const file of files) {
      fileStatuses.set(file, 'extraction-pending')
    }
    fileStatuses = fileStatuses

    for await (const result of extractStreams(files, fileResults, $preferences)) {
      switch (result.type) {
        case 'file':
          await controller.enqueue(result.name, result.contents)
          break
        case 'file-status':
          fileStatuses.set(result.file, result.status)
          fileStatuses = fileStatuses
          pendingFiles--

          if (result.errorLogs?.length) {
            const existentLogs = fileExtractionErrors.get(result.file) ?? []
            fileExtractionErrors.set(result.file, existentLogs.concat(result.errorLogs))
            fileExtractionErrors = fileExtractionErrors
          }
          break
      }
    }

    await controller.close()
    pendingFiles = 0
  }

  function handlePlural (value, singular, plural) {
    return value + ' ' + (value === 1 ? singular : (plural || singular + 's'))
  }

  function renderFileTagline (result) {
    const streams = result.parsed.streams
    const selectedStreams = streams.filter(e => e.selected)
    if (!selectedStreams.length) return 'No streams selected'
    return handlePlural(selectedStreams.length, 'stream') + ' selected'
  }

  function renderStreamLabel (stream) {
    return `${stream.codec_type}: ${stream.codec_name} ${
      stream.tags?.title ? ` - "${stream.tags.title}"` : ''
    }${
      stream.tags?.filename ? ` - "${stream.tags.filename}"` : ''
    }${
      stream.tags?.language ? ` (${stream.tags.language})` : ''
    }`
  }

  let canStartExtraction
  $: {
    canStartExtraction = files.length && pendingFiles === 0 && files.some(file => {
      return fileStatuses.get(file) === 'loaded' && fileResults.get(file)?.parsed?.streams?.some(e => e.selected)
    })
  }
</script>

<Grid>
  <Row>
    <Column>
      <h1>MKV Extract</h1>
      <FileUploaderDropContainer
        class="large-drop"
        labelText={
          files.length === 0
            ? 'Click or drop files here to extract'
            : files.length === 1
              ? '1 file opened'
              : files.length + ' files opened'
        }
        accept={['.mkv', '.mka', '.mks', '.mk3d', 'video/*']}
        on:change={handleFiles}
        bind:files
        multiple
      />
    </Column>
  </Row>

  {#if files.length === 0}
    <Row>
      <Column>
        <ContentSwitcher bind:selectedIndex={$preferences.manualMode}>
          <Switch text="Automatic mode" />
          <Switch text="Manual mode" />
        </ContentSwitcher>
      </Column>
    </Row>
  {/if}

  <Row padding>
    <Column>
      {#if files.length}
        <Accordion>
          {#each files as file}
            {@const status = fileStatuses.get(file)}
            {@const result = fileResults.get(file)}
            {@const streams = result?.parsed?.streams}
            <AccordionItem>
              <svelte:fragment slot="title">
                <h5>{file.name}</h5>
                {#if status === 'loading'}
                  <InlineLoading status="active" description="Processing file..." />
                {:else if status === 'loaded'}
                  <InlineLoading status="finished" description="{renderFileTagline(result)}" />
                {:else if status === 'extraction-pending'}
                  <InlineLoading status="inactive" description="Waiting to start extraction" />
                {:else if status === 'extracting'}
                  <InlineLoading status="active" description="Extracting..." />
                {:else if status === 'finished'}
                  <InlineLoading status="finished" description="Extraction finished" />
                {:else if status === 'load-error'}
                  <InlineLoading status="error" description="Could not load the file" />
                {:else if status === 'extraction-error'}
                  <InlineLoading status="error" description="Could not extract streams" />
                {:else if status === 'partial-extraction-error'}
                  <InlineLoading status="error" description="Could not extract some streams" />
                {/if}
              </svelte:fragment>

              {#if status === 'loading'}
                <div>Please wait while file is loading</div>
              {:else if status === 'loaded'}
                {#each streams as stream}
                  <Checkbox labelText={renderStreamLabel(stream)} bind:checked={stream.selected} />
                {/each}
              {:else if status === 'load-error'}
                <CodeSnippet type="multi" code={result.stderr} hideCopyButton expanded wrapText />
              {:else if status === 'extraction-error' || status === 'partial-extraction-error'}
                {#each fileExtractionErrors.get(file) as code}
                  <CodeSnippet type="multi" {code} hideCopyButton expanded wrapText />
                {/each}
              {:else if streams}
                {#each streams as stream}
                  <Checkbox labelText={renderStreamLabel(stream)} bind:checked={stream.selected} disabled />
                {/each}
              {/if}
            </AccordionItem>
          {/each}
        </Accordion>

        {#if $preferences.manualMode}
          <Button
            disabled={!canStartExtraction}
            class="start-extract-btn"
            on:click={startZipExtraction}
          >Extract to ZIP file</Button>

          {#if window.showDirectoryPicker}
            <TooltipDefinition
              tooltipText="Please do NOT select the Downloads folder nor system folders nor any other folder which may contain privacy sensitive content."
              direction="top"
              class="start-extract-btn"
            >
              <Button
                disabled={!canStartExtraction}
                on:click={startFolderExtraction}
                kind="secondary"
              >Extract to folder</Button>
            </TooltipDefinition>
          {/if}
        {/if}
      {:else}
        {#if $preferences.manualMode}
          <p>A list of streams will be shown after files being opened, defaulting to the ones set on the settings.</p>
        {:else}
          <p>Streams will be extracted and zipped based on the filters set on the settings.</p>
        {/if}
      {/if}
    </Column>
  </Row>
</Grid>
