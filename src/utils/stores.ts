import { persisted } from 'svelte-local-storage-store'

export const defaultPreferences = {
  manualMode: 0,
  subtitleMode: 'all',
  attachmentMode: 'all',
  metadataMode: 'skip',
  videoMode: 'skip',
  audioMode: 'skip',
  subtitleLanguages: '',
  subtitleFile: '{FilenameNoExt}_{TrackName}_track{TrackNumber}_[{Language}]',
  attachmentFile: '{AttachmentFilename}',
  metadataFile: '{FilenameNoExt}_metadata',
  videoFile: '{FilenameNoExt}_track{TrackNumber}_[{Language}]',
  audioFile: '{FilenameNoExt}_track{TrackNumber}_[{Language}]',
  collisionMode: 'rename'
}

export const preferences = persisted('mkv-extract-preferences', {...defaultPreferences})

export function resetPreferences () {
  preferences.set({...defaultPreferences})
}
