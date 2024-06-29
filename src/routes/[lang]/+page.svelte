<script>
  import { preferences } from '/~/utils/stores'
  import handleFile, { selectedSymbol } from '/~/utils/handle-file'
  import extractStreams from '/~/utils/extract-streams'
  import { base } from '$app/paths'

  import {
    Grid, Row, Column,
    FormGroup, Button,
    Accordion, AccordionItem,
    ContentSwitcher, Switch,
    Checkbox, CodeSnippet,
    TooltipDefinition,
    InlineLoading
  } from 'carbon-components-svelte'
  
  import FileUploaderDropContainer from '/~/components/FileUploaderDropContainer.svelte'
  
  import { t } from '$lib/translations'

  let files = []
  let fileStatuses = new WeakMap()
  let fileResults = new WeakMap()
  let fileExtractionErrors = new WeakMap()
  let pendingFiles = 0
  const accordionOpen = Symbol('accordion open')

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
              fileResults.get(file)?.parsed?.streams?.some(e => e[selectedSymbol])
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

    // Chromium for some reason considers ~ to be an unsafe character (last checked on Chromium 109)
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
    const streamCount = files.reduce((sum, file) => {
      return sum + (fileResults.get(file)?.parsed?.streams?.filter(e => e[selectedSymbol])?.length || 0)
    }, 0)
    if (streamCount === 1) return startSingleStreamDownload()

    const {createZipWriter} = await import('/~/utils/zip-stream')
    const {default: streamSaver} = await import('streamsaver')
    
    streamSaver.mitm = base + '/streamsaver-mitm.html'

    let zipController
    const zipStream = createZipWriter({
      start (controller) {
        zipController = controller
      }
    })

    const namePrefix = new Date().toISOString().slice(0, 19).replace('T', ' ').replace(/[^\d ]+/g, '-')
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
  
  async function startSingleStreamDownload () {
    const {default: streamSaver} = await import('streamsaver')
    let writer
    
    return handleExtraction({
      enqueue (name, contents) {
        const fileStream = streamSaver.createWriteStream(name)
        writer = fileStream.getWriter()
        writer.write(contents)
      },
      close () {
        writer.close()
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

          const existentLogs = fileExtractionErrors.get(result.file) ?? []
          fileExtractionErrors.set(result.file, existentLogs.concat(result.errorLogs))
          fileExtractionErrors = fileExtractionErrors
          break
      }
    }

    await controller.close()
    pendingFiles = 0
  }

  function handlePlural (value, singular, plural) {
    return value + ' ' + (value === 1 ? singular : (plural || singular + 's'))
  }

  function renderFileTagline (result, accordionOpen) {
    const streams = result.parsed.streams
    const selectedStreams = streams.filter(e => e[selectedSymbol])
    if (!selectedStreams.length) {
      return accordionOpen
        ? $t('streams.no-selected-closed')
        : $t('streams.no-selected-open')
    }
    return $t('streams.selected', {count: selectedStreams.length})
  }

  function renderStreamLabel (stream) {
    const codecName = stream.codec_type === 'metadata'
      ? $t('streams.metadata-name', { count: stream.codec_name })
      : stream.codec_name
    return `${stream.codec_type}: ${codecName} ${
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
      return fileStatuses.get(file) === 'loaded' && fileResults.get(file)?.parsed?.streams?.some(e => e[selectedSymbol])
    })
  }
</script>

<svelte:head>
  <title>{$t('main.name')} - {$t('main.description')}</title>
  <meta name="description" content={$t('main.description')}>
</svelte:head>

<Grid>
  <Row>
    <Column>
      <h1>{$t('main.name')}</h1>
      <p>{$t('main.description')}</p>
      <FileUploaderDropContainer
        class="large-drop"
        labelText={$t('main.file-count', {count: files.length})}
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
          <Switch text={$t('main.automatic-mode')} />
          <Switch text={$t('main.manual-mode')} />
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
            <AccordionItem bind:open={file[accordionOpen]}>
              <svelte:fragment slot="title">
                <h5 class="break-all">{file.name}</h5>
                {#if status === 'loading'}
                  <InlineLoading status="active" description={$t('status.loading', { count: files.length })} />
                {:else if status === 'loaded'}
                  {renderFileTagline(result, file[accordionOpen])}
                {:else if status === 'extraction-pending'}
                  <InlineLoading status="inactive" description={$t('status.extraction-pending')}  />
                {:else if status === 'extracting'}
                  <InlineLoading status="active" description={$t('status.extracting')}  />
                {:else if status === 'finished'}
                  <InlineLoading status="finished" description={$t('status.finished')}  />
                {:else if status === 'skipped'}
                  <InlineLoading status="finished" description={$t('status.skipped')}  />
                {:else if status === 'load-error'}
                  <InlineLoading status="error" description={$t('status.load-error')}  />
                {:else if status === 'extraction-error'}
                  <InlineLoading status="error" description={$t('status.extraction-error')}  />
                {:else if status === 'partial-extraction-error'}
                  <InlineLoading status="error" description={$t('status.partial-extraction-error')}  />
                {/if}
              </svelte:fragment>

              {#if status === 'loading'}
                <div>{$t('main.file-loading', { count: files.length })}</div>
              {:else if status === 'loaded'}
                {#each streams as stream}
                  <Checkbox labelText={renderStreamLabel(stream)} bind:checked={stream[selectedSymbol]} />
                {/each}
              {:else if status === 'load-error'}
                <CodeSnippet type="multi" code={result.stderr} hideCopyButton expanded wrapText />
              {:else if status === 'extraction-error' || status === 'partial-extraction-error'}
                {#each fileExtractionErrors.get(file) as code}
                  <CodeSnippet type="multi" {code} hideCopyButton expanded wrapText />
                {/each}
              {:else if streams}
                {#each streams as stream}
                  <Checkbox labelText={renderStreamLabel(stream)} bind:checked={stream[selectedSymbol]} disabled />
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
          >{$t('main.zip-select')}</Button>

          {#if window.showDirectoryPicker}
            <TooltipDefinition
              tooltipText={$t('main.folder-select-tooltip')}
              direction="top"
              class="start-extract-btn"
            >
              <Button
                disabled={!canStartExtraction}
                on:click={startFolderExtraction}
                kind="secondary"
              >{$t('main.folder-select')}</Button>
            </TooltipDefinition>
          {/if}
        {/if}
      {:else}
        {#if $preferences.manualMode}
          <p>{$t('main.manual-mode-explained', {folderEnabled: !!window.showDirectoryPicker})}</p>
        {:else}
          <p>{$t('main.automatic-mode-explained')}</p>
        {/if}
      {/if}
    </Column>
  </Row>
</Grid>
