/* global JSZip, saveAs */
const ebml = require('ebml')
const fileReaderStream = require('filereader-stream')
const progressStream = require('progress-stream')

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

function handleFiles (event) {
  const files = event.target.files
  statusEl.textContent = `Loading ${files.length} ${files.length === 1 ? 'file' : 'files'}...`

  const loadedData = []
  const sumSizes = Array.from(files).map(e => e.size).reduce((a, b) => a + b, 0)
  let alreadyLoaded = 0
  let errors = 0

  processFile(0)

  function processFile (fileIndex) {
    const file = files[fileIndex]
    if (!file) return packData()
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
    handleStream(fileStream.pipe(stats), (error, data) => {
      stats.destroy()
      if (error) errors++
      if (!error) {
        loadedData.push({ filename, data })
      }
      processFile(fileIndex + 1)
    })
  }

  function packData () {
    statusEl.textContent = `${loadedData.length} ${loadedData.length === 1 ? 'file' : 'files'} extracted - ${errors} failed`
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
    zip.generateAsync({type: 'blob'})
    .then(content => saveAs(content, filename))
  }
}

function handleStream (stream, callback) {
  const decoder = new ebml.Decoder()
  const tracks = []
  const trackData = []
  const files = []
  let currentFile = 0
  let currentTimecode
  let trackIndexTemp
  let trackTypeTemp
  let trackDataTemp
  let trackIndex

  decoder.on('error', (error) => {
    callback(error)
    stream.destroy()
  })

  decoder.on('data', (chunk) => {
    switch (chunk[0]) {
      case 'end':
        // if (chunk[1].name === 'Info') {
        //   stream.destroy()
        // }
        if (chunk[1].name === 'TrackEntry') {
          if (trackTypeTemp === 0x11) {
            tracks.push(trackIndexTemp)
            trackData.push([trackDataTemp])
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
        if (chunk[1].name === 'BlockDuration') {
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
      const isASS = heading.includes('Format:')
      const formatFn = isASS ? formatTimestamp : formatTimestampSRT
      const eventMatches = isASS ? heading.match(/\[Events\]\s+Format:([^\r\n]*)/) : ['']
      const headingParts = isASS ? heading.split(eventMatches[0]) : ['', '']
      const fixedLines = []
      for (let i = 1; i < entries.length; i += 4) {
        const line = entries[i]
        const lineTimestamp = entries[i + 1]
        const chunkTimestamp = entries[i + 2]
        const duration = entries[i + 3]
        const lineParts = isASS && line.split(',')
        const lineIndex = isASS ? lineParts[0] : (i - 1) / 4
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

    if (files.length === 0) {
      callback(Error('No data found'))
      return
    }

    callback(null, files)
  })

  stream.pipe(decoder)
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
  const seconds = timestamp / 1000
  const hh = Math.floor(seconds / 3600)
  let mm = Math.floor((seconds - (hh * 3600)) / 60)
  let ss = (seconds - (hh * 3600) - (mm * 60)).toFixed(2)

  if (mm < 10) mm = `0${mm}`
  if (ss < 10) ss = `0${ss}`

  return `${hh}:${mm}:${ss}`
}

function formatTimestampSRT (timestamp) {
  const seconds = timestamp / 1000
  let hh = Math.floor(seconds / 3600)
  let mm = Math.floor((seconds - (hh * 3600)) / 60)
  let ss = (seconds - (hh * 3600) - (mm * 60)).toFixed(3)

  if (hh < 10) hh = `0${hh}`
  if (mm < 10) mm = `0${mm}`
  if (ss < 10) ss = `0${ss}`

  return `${hh}:${mm}:${ss}`
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
