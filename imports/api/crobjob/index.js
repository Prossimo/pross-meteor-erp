import { SyncedCron } from 'meteor/percolate:synced-cron'
import backupEmailAttachments from './backupEmailAttachments'

SyncedCron.add({
  name: 'backup email attachments',
  schedule: parser => parser.text('every 30 minutes'),
  job: backupEmailAttachments,
})

//SyncedCron.start()
