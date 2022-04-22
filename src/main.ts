// Why? I don't know.
import 'regenerator-runtime/runtime'

import ebml from 'ebml'
import fileReaderStream from 'filereader-stream'
import progressStream from 'progress-stream'
import saveAs from 'save-as'
import JSZip from 'jszip'
import pipeline from 'promisepipe'

const input = document.querySelector('input')
const droparea = document.querySelector('.file-drop-area')
const statusEl = document.querySelector('.file-msg')

input.addEventListener('change', handleFiles)

// highlight drag area
const activeElements = ['dragenter', 'focus', 'click']
activeElements.forEach(event => input.addEventListener(event, handleDropActive))
function handleDropActive () {
  droparea.classList.add('is-active')
}

// back to normal state
const inactiveEvents = ['dragleave', 'blur', 'drop']
inactiveEvents.forEach(event => input.addEventListener(event, handleDropInactive))
function handleDropInactive () {
  droparea.classList.remove('is-active')
}

async function handleFiles (event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  statusEl.textContent = `Loading ${files.length} ${files.length === 1 ? 'file' : 'files'}...`

  const loadedData = []
  const sumSizes = Array.from(files).map(e => e.size).reduce((a, b) => a + b, 0)
  let alreadyLoaded = 0
  let errors = 0

  for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
    const file = files[fileIndex]
    const filename = file.name
    const fileStream = fileReaderStream(file, {
      chunkSize: 2 * 1024 * 1024
    })

    const stats = progressStream({
      time: 1000,
      length: sumSizes,
      transferred: alreadyLoaded
    }, progress => {
      // Avoid false ending:
      if (progress.percentage === 100 && fileIndex + 1 !== files.length) return

      statusEl.textContent = 'Loading file ' + (fileIndex + 1) + ' / ' + files.length + ': ' +
        progress.percentage.toFixed(2) + '% (' + formatDuration(progress.eta) + ' remaining)'
    })

    alreadyLoaded += file.size

    try {
      const data = await handleStream(fileStream, stats)
      loadedData.push({ filename, data })
    } catch (error) {
      errors++
    } finally {
      stats.destroy()
    }
  }

  statusEl.textContent = `${loadedData.length} ${loadedData.length === 1 ? 'file' : 'files'} extracted` +
    (errors === 0 ? '' : ` - ${errors} failed`)
  if (loadedData.length === 0) return

  const zip = new JSZip()
  let filename
  if (loadedData.length === 1) {
    filename = loadedData[0].filename + '_tracks.zip'
    loadedData[0].data.forEach(entry => {
      zip.file(entry.name, entry.data)
    })
  } else {
    filename = `${Date.now().toString(36)}_tracks.zip`
    loadedData.forEach(file => {
      const folder = zip.folder(file.filename)
      file.data.forEach(entry => {
        folder.file(entry.name, entry.data)
      })
    })
  }

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, filename)
}

async function handleStream (stream, stats) {
  const decoder = new ebml.Decoder()
  const tracks = []
  const trackData = []
  const files = []
  let currentFile = 0
  let currentTimecode
  let currentCodecId
  let trackIndexTemp
  let trackTypeTemp
  let trackDataTemp
  let trackIndex

  decoder.on('data', (chunk) => {
    switch (chunk[0]) {
      case 'end':
        if (chunk[1].name === 'TrackEntry') {
          if (trackTypeTemp === 0x11) {
            tracks.push(trackIndexTemp)
            trackData.push([trackDataTemp, currentCodecId])
          }
        }
        break
      case 'tag':
        if (chunk[1].name === 'FileName') {
          if (!files[currentFile]) files[currentFile] = {}
          files[currentFile].name = chunk[1].data.toString()
        }
        if (chunk[1].name === 'FileData') {
          if (!files[currentFile]) files[currentFile] = {}
          files[currentFile].data = chunk[1].data
        }
        if (chunk[1].name === 'TrackNumber') {
          trackIndexTemp = chunk[1].data[0]
        }
        if (chunk[1].name === 'TrackType') {
          trackTypeTemp = chunk[1].data[0]
        }
        if (chunk[1].name === 'CodecPrivate') {
          trackDataTemp = chunk[1].data.toString()
        }
        if (chunk[1].name === 'CodecID') {
          currentCodecId = chunk[1].data.toString()
        }
        if (chunk[1].name === 'SimpleBlock' || chunk[1].name === 'Block') {
          const trackLength = ebml.tools.readVint(chunk[1].data)
          trackIndex = tracks.indexOf(trackLength.value)
          if (trackIndex !== -1) {
            const timestampArray = new Uint8Array(chunk[1].data)
              .slice(trackLength.length, trackLength.length + 2)
            const timestamp = new DataView(timestampArray.buffer).getInt16(0)
            const lineData = chunk[1].data.slice(trackLength.length + 3)
            trackData[trackIndex].push(lineData.toString(), timestamp, currentTimecode)
          }
        }
        if (chunk[1].name === 'Timecode') {
          const timecode = readUnsignedInteger(padZeroes(chunk[1].data))
          currentTimecode = timecode
        }
        if (chunk[1].name === 'BlockDuration' && trackIndex !== -1) {
          // the duration is in milliseconds
          const duration = readUnsignedInteger(padZeroes(chunk[1].data))
          trackData[trackIndex].push(duration)
        }
        break
    }
    if (files[currentFile] && files[currentFile].name && files[currentFile].data) {
      currentFile++
    }
  })

  stream.on('end', () => {
    trackData.forEach((entries, index) => {
      const heading = entries[0]
      const codecId = entries[1]
      const isASS = codecId === 'S_TEXT/ASS' || codecId === 'S_TEXT/SSA'
      const isSRT = codecId === 'S_TEXT/UTF8'

      // Subtitle formats other than SSA/ASS ans SRT are not supported at the moment
      if (!isASS && !isSRT) return

      const formatFn = isASS ? formatTimestamp : formatTimestampSRT
      const eventMatches = isASS ? heading.match(/\[Events\]\s+Format:([^\r\n]*)/) : ['']
      const headingParts = isASS ? heading.split(eventMatches[0]) : ['', '']
      const fixedLines = []

      for (let i = 2; i < entries.length; i += 4) {
        const line = entries[i]
        const lineTimestamp = entries[i + 1]
        const chunkTimestamp = entries[i + 2]
        const duration = entries[i + 3]
        const lineParts = isASS && line.split(',')
        const lineIndex = isASS ? lineParts[0] : (i - 2) / 4
        const startTimestamp = formatFn(chunkTimestamp + lineTimestamp)
        const endTimestamp = formatFn(chunkTimestamp + lineTimestamp + duration)

        const fixedLine = isASS
          ? ('Dialogue: ' + [lineParts[1], startTimestamp, endTimestamp]
            .concat(lineParts.slice(2)).join(','))
          : ((lineIndex + 1) + '\r\n' +
          startTimestamp.replace('.', ',') + ' --> ' + endTimestamp.replace('.', ',') + '\r\n' +
          line + '\r\n')

        if (fixedLines[lineIndex]) {
          fixedLines[lineIndex] += '\r\n' + fixedLine
        } else {
          fixedLines[lineIndex] = fixedLine
        }
      }

      const data = (isASS ? (headingParts[0] + eventMatches[0] + '\r\n') : '') +
        fixedLines.join('\r\n') + headingParts[1] + '\r\n'

      files.push({
        name: 'Subtitle_' + (index + 1) + (isASS ? '.ass' : '.srt'),
        data
      })
    })
  })

  let closeGlobalHandler
  const handleGlobalErrors = new Promise((resolve, reject) => {
    function globalErrorHandler () {
      reject(Error('Unhandled global error'))
      window.removeEventListener('error', globalErrorHandler)
    }
    closeGlobalHandler = () => {
      resolve()
      window.removeEventListener('error', globalErrorHandler)
    }
    window.addEventListener('error', globalErrorHandler)
  })

  await Promise.race([
    pipeline(stream, stats, decoder),
    handleGlobalErrors
  ])
  closeGlobalHandler()

  if (files.length === 0) throw Error('No data found')
  return files
}

function padZeroes (arr) {
  const len = Math.ceil(arr.length / 2) * 2
  const output = new Uint8Array(len)
  output.set(arr, len - arr.length)
  return output.buffer
}

function readUnsignedInteger (data) {
  const view = new DataView(data)
  return data.byteLength === 2
    ? view.getUint16(0)
    : view.getUint32(0)
}

function formatTimestamp (timestamp) {
  return new Date(timestamp).toISOString().substring(11, 22).replace(/^0/, '')
}

function formatTimestampSRT (timestamp) {
  return new Date(timestamp).toISOString().substring(11, 22)
}

function formatDuration (duration) {
  // Moment.js is the new jQuery
  duration = Math.round(duration)
  if (duration < 2) return 'few seconds'
  if (duration < 58) return duration + ' seconds'
  if (duration < 120) return '1 minute'
  if (duration < 3598) return Math.floor(duration / 60) + ' minutes'
  if (duration < 7200) return '2 hours'
  return Math.floor(duration / 3600) + ' hours'
}
