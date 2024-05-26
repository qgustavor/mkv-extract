import { Mutex } from 'async-mutex'

export const selectedSymbol = Symbol('selected')

function handleFile (file, preferences) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('../ffprobe-worker-mkve.js')
    let stdout = ''
    let stderr = ''
    
    worker.addEventListener('message', e => {
      const msg = e.data

      switch (msg.type) {
        case 'ready':
          worker.postMessage({
            type: 'run',
            arguments: [
              '/data/' + file.name,
              '-print_format', 'json',
              '-show_streams',
              '-show_format',
              '-show_chapters'
            ],
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
          let parsed, error
          try {
            parsed = JSON.parse(stdout)
            if (!parsed.streams || parsed.streams.length === 0) {
              throw Error('No streams found')
            }
            autoSelectStreams(parsed, preferences)
          } catch (err) {
            error = err
          } finally {
            resolve({ parsed, error, stdout, stderr })
            worker.terminate()
            break
          }
      }
    })
  })
}

// Only allow a single operation of handleFile at any time
const mutex = new Mutex()
async function handleFileWrapped (file, preferences) {
  const release = await mutex.acquire()
  
  try {
    return await handleFile(file, preferences)
  } finally {
    release()
  }
}

function autoSelectStreams (ffprobeResult, preferences) {
  const { subtitleMode, attachmentMode, audioMode, videoMode, metadataMode, subtitleLanguages } = preferences
  const flagMap = {
    attachment: attachmentMode,
    subtitle: subtitleMode,
    audio: audioMode,
    video: videoMode 
  }
  const subtitleLanguagesArr = subtitleLanguages.toLowerCase().split(/[^a-z]+/g)
  for (const stream of ffprobeResult.streams) {
    const flag = flagMap[stream.codec_type]
    stream[selectedSymbol] = flag === 'lang'
      ? subtitleLanguagesArr.includes(stream.tags?.language)
      : flag !== 'skip'
  }
  
  const chapterCount = ffprobeResult?.chapters?.length || 0
  ffprobeResult.streams.unshift({
    codec_type: 'metadata',
    codec_name: chapterCount,
    [selectedSymbol]: metadataMode !== 'skip'
  })
}

export default handleFileWrapped
