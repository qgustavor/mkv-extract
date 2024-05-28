import { selectedSymbol } from './handle-file'
import { base } from '$app/paths'

export default async function* extractStreams (files, results, preferences) {
  const nameTemplateMap = {
    subtitle: preferences.subtitleFile,
    video: preferences.videoFile,
    audio: preferences.audioFile,
  }
  const codecExtensionMap = {
    subrip: 'srt'
  }
  const textEncoder = new TextEncoder()

  for (const file of files) {
    yield { type: 'file-status', status: 'extracting', file }

    const { parsed } = results.get(file)
    const errorLogs = []
    let gotSuccess = false

    const selectedStreams = parsed?.streams?.filter(stream => stream[selectedSymbol])
    if (!selectedStreams || selectedStreams.length === 0) {
      yield {
        type: 'file-status',
        status: 'skipped',
        errorLogs,
        file
      }
      continue
    }

    const attachmentStreams = selectedStreams.filter(stream => stream.codec_type === 'attachment')
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
    const fastLaneStreams = selectedStreams.filter(stream =>
      stream.codec_type === 'subtitle' &&
      fastLaneCodecs.includes(stream.codec_name)
    )

    if (fastLaneStreams.length) {
      const nameMap = new Map()
      const streamMap = new Map()
      const argv = fastLaneStreams.map(stream => {
        const formatExt = codecExtensionMap[stream.codec_name] ?? stream.codec_name
        const nameTemplate = nameTemplateMap[stream.codec_type]
        const name = interpolateFilename(nameTemplate, file, parsed, stream) + '.' + formatExt
        const basename = name.split('/').pop()
        nameMap.set(basename, name)
        streamMap.set(basename, stream)
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

      // Mark successful streams as not selected so failed streams will be extracted individually
      // (solves issues when extracting multiple streams at the same time fails from OOM errors)
      for (const file of ffmpegResult.files) {
        streamMap.get(file.name)[selectedSymbol] = false
      }
    }

    for (const stream of selectedStreams) {
      if (!stream[selectedSymbol]) continue
      if (stream.codec_type === 'metadata') {
        // Do not include the generated metadata track and remove /data/ from format.filename
        const clone = structuredClone(parsed)
        clone.streams.shift()
        clone.format.filename = clone.format.filename.slice(6)

        yield {
          type: 'file',
          name: interpolateFilename(preferences.metadataFile, file, parsed) + '.json',
          contents: textEncoder.encode(JSON.stringify(clone))
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
    const worker = new Worker(base + '/ffmpeg-worker-mkve.js')
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
    worker.addEventListener('error', reject)
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
