export default async function* extractStreams (files, results, preferences) {
  const nameTemplateMap = {
    subtitle: preferences.subtitleFile,
    video: preferences.videoFile,
    audio: preferences.audioFile,
  }
  const codecExtensionMap = {
    subrip: 'srt'
  }

  for (const file of files) {
    yield { type: 'file-status', status: 'extracting', file }

    const { parsed } = results.get(file)
    const errorLogs = []
    let gotSuccess = false

    const attachmentStreams = parsed.streams.filter(stream => stream.codec_type === 'attachment' && stream.selected)
    if (attachmentStreams.length !== 0) {
      const ffmpegResult = await runCommand(file, [
        '-dump_attachment:t', '',
        '-i', '/data/' + file.name
      ])
      let gotError = false
      if (ffmpegResult.files.length !== attachmentStreams.length) {
        gotError = true
      }
      for (const stream of attachmentStreams) {
        const attachmentName = stream.tags?.filename
        const resultFile = ffmpegResult.files.find(e => e.name === attachmentName)
        if (resultFile) {
          const name = interpolateFilename(preferences.attachmentFile, file, parsed, stream)
          const contents = resultFile.data
          yield { type: 'file', name, contents }
          gotSuccess = true
        } else {
          gotError = true
        }
      }
      if (gotError) errorLogs.push(ffmpegResult.stderr)
    }

    const fastLaneCodecs = ['ass', 'subrip']
    const fastLaneStreams = parsed.streams.filter(stream =>
      stream.selected &&
      stream.codec_type === 'subtitle' &&
      fastLaneCodecs.includes(stream.codec_name)
    )
    
    if (fastLaneStreams.length) {
      const nameMap = new Map()
      const argv = fastLaneStreams.map(stream => {
        const formatExt = codecExtensionMap[stream.codec_name] ?? stream.codec_name
        const nameTemplate = nameTemplateMap[stream.codec_type]
        const name = interpolateFilename(nameTemplate, file, parsed, stream) + '.' + formatExt
        const basename = name.split('/').pop()
        nameMap.set(basename, name)
        return [
          '-i', '/data/' + file.name,
          '-map', '0:' + stream.index,
          '-codec', 'copy',
          basename
        ]
      }).flat()
      const ffmpegResult = await runCommand(file, argv)
      for (const file of ffmpegResult.files) {
        const name = nameMap.get(file.name)
        const contents = file.data
        yield { type: 'file', name, contents }
        gotSuccess = true
      }
      const missingFiles = Array.from(nameMap.keys())
        .filter(basename => !ffmpegResult.files.some(file => file.name === basename))
      if (missingFiles.length) {
        errorLogs.push(ffmpegResult.stderr)
      }
    }

    for (const stream of parsed.streams) {
      if (!stream.selected) continue
      if (fastLaneStreams.includes(stream)) continue
      if (stream.codec_type === 'metadata') {
        yield {
          type: 'file',
          name: interpolateFilename(preferences.metadataFile, file, parsed) + '.json',
          contents: JSON.stringify(parsed)
        }
        gotSuccess = true
        continue
      }

      const nameTemplate = nameTemplateMap[stream.codec_type]
      if (!nameTemplate) continue

      const formats = [
        [null, codecExtensionMap[stream.codec_name] ?? stream.codec_name],
        ['mp4', stream.codec_type === 'audio' ? 'm4a' : 'mp4'],
        ['matroska', stream.codec_type === 'audio' ? 'mka' : stream.codec_type === 'subtitle' ? 'mks' : 'mkv']
      ]

      let lastStreamError
      for (const [formatName, formatExt] of formats) {
        const name = interpolateFilename(nameTemplate, file, parsed, stream) + '.' + formatExt
        const basename = name.split('/').pop()
        const ffmpegResult = await runCommand(file, [
          '-i', '/data/' + file.name,
          '-map', '0:' + stream.index,
          '-codec', 'copy',
          ...(formatName ? ['-f', formatName] : []),
          basename
        ])

        const resultFile = ffmpegResult.files[0]
        if (resultFile) {
          const contents = resultFile.data
          yield { type: 'file', name, contents }
          gotSuccess = true
          lastStreamError = null
          break
        }

        lastStreamError = ffmpegResult.stderr
      }

      if (lastStreamError) {
        errorLogs.push(lastStreamError)
      }
      continue
    }

    yield {
      type: 'file-status',
      status: !gotSuccess
        ? 'extraction-error'
        : errorLogs.length
          ? 'partial-extraction-error'
          : 'finished',
      errorLogs,
      file
    }
  }
}

function runCommand (file, argv) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./ffmpeg-worker-mkve.js')
    let stdout = ''
    let stderr = ''

    function messageHandler (e) {
      const msg = e.data

      switch (msg.type) {
        case 'ready':
          worker.postMessage({
            type: 'run',
            arguments: argv,
            mounts: [{
              type: 'WORKERFS',
              opts: {
                files: [file]
              },
              mountpoint: '/data'
            }]
          })
          break
        case 'stdout':
          stdout += msg.data + '\n'
          break
        case 'stderr':
          stderr += msg.data + '\n'
          break
        case 'done':
          const files = msg.data.MEMFS
          resolve({ files, stdout, stderr })
          worker.removeEventListener('message', messageHandler)
          worker.terminate()
          break
      }
    }

    worker.addEventListener('message', messageHandler)
  })
}

function interpolateFilename (template, file, parsed, stream) {
  return template.replaceAll(/\{(.*?)\}/g, (all, key) => {
    switch (key.toLowerCase()) {
      case 'filename':
        return file.name
      case 'filenamenoext':
        return file.name.replace(/\.[^.]*$/, '')
      case 'trackname':
        return stream.tags?.title ?? 'untitled'
        break
      case 'tracknumber':
        if (stream) return stream.index
        break
      case 'language':
        return stream.tags?.language ?? 'unk'
        break
      case 'attachmentfilename':
        return stream.tags?.filename ?? 'unnamed'
        break
    }
    return all
  })
}
