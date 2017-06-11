import { SyncedCron } from 'meteor/percolate:synced-cron'
import { drive } from '/imports/api/drive/methods/drive'

drive.changes.list({
  pageToken: 48874,
}, (error, result) => {
  console.log(error)
  console.log(result)
})
SyncedCron.add({
  name: 'Detect Google File Changes',
  schedule: parser => parser.text('every 2 mimutes'),
  job() {
    console.log('FF job')
  }
})

SyncedCron.start()
