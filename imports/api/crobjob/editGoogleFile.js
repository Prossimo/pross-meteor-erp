import { SyncedCron } from 'meteor/percolate:synced-cron'
import { drive } from '/imports/api/drive/methods/drive'
import { WebApp } from 'meteor/webapp'
import { Random } from 'meteor/random'
import { SalesRecords, Projects } from '/imports/api/models'
import bodyParser from 'body-parser'
import { slack } from '/imports/api/config/config'
import { HTTP } from 'meteor/http'

const { apiRoot } = slack
const token = 'xoxb-143253157236-cBzs3iNbCDuxCOIHTPnI2LHG'

// SEND SLACK MESSAGE
const sendMessage = ({ channel, text, attachments }) => {
  const params = {
    token,
    channel,
    username: 'prossimobot',
    as_user: false,
  }
  text && (params.text = text)
  attachments && (params.attachments = attachments)
  HTTP.post(`${apiRoot}/chat.postMessage`, {
    params,
  })
}

// SEND SLACK ATTACHMENTS
const sendAttachment = ({ pretext, title, text, color, title_link, channel }) => {
  const attachment = {
    pretext,
    title,
    text,
    color,
    title_link,
  }
  sendMessage({
    channel,
    attachments: JSON.stringify([attachment]),
  })
}

let { startPageToken: pageToken } = Meteor.wrapAsync(drive.changes.getStartPageToken)()

//drive.changes.watch({
  //pageToken,
  //resource: {
    //id: Random.id(),
    //address: 'https://d199e30f.ngrok.io/notifications',
    //type: 'web_hook'
  //}
//}, (error, result) => {
  //console.log(error)
  //console.log(result)
//})
//drive.channels.stop({
  //resource: {
    //id: '9bqCnhrbBLw6o8rXc',
    //resourceId: 'N-iyjwBVPquFNkG6Ydps_1ierjk'
  //}
//}, (error, result) => {
  //console.log(error)
  //console.log(result)
//})
const countComments = (fileId) => {
  const getCommentSync = Meteor.wrapAsync(drive.comments.list)
  let nComments = 0
  let commentList = getCommentSync({ fileId, pageSize: 1, fields: '*' })
  nComments += commentList.comments.length
  while (commentList.nextPageToken) {
    commentList = getCommentSync({ fileId, pageSize: 1, fields: '*' })
    nComments += commentList.comments.length
  }
  console.log(nComments)
}
countComments('1qvJAm4oewkTWvPOO_sIWV81ve-6aKcl3_YprRMIq79A')
const getFileWithParent = (fileId) => {
  const getFileSync = Meteor.wrapAsync(drive.files.get)
  const {id, name, webViewLink, parents} = getFileSync({ fileId, fields: 'id,name,webViewLink,parents' })
  if (parents && parents.length) {
    return { id, name, webViewLink, parentId: _.first(parents) }
  }
  return null
}

const getAncestors = (fileId) => {
  const ancestors = []
  // GET DIRECT PARENTS
  let fileWithParent = getFileWithParent(fileId)
  while(fileWithParent) {
    ancestors.push(fileWithParent)
    fileWithParent = getFileWithParent(fileWithParent.parentId)
  }
  return ancestors
}

const fileToChannel = {}
let changedFiles = {}
SyncedCron.add({
  name: 'Notify slack about file changes',
  schedule: (parser) => parser.text('every 1 minutes'),
  job() {
    Object.values(changedFiles).forEach(({ fileId }) => {
      let slackChanel = null
      let ancestors = null
      if (fileToChannel[fileId]) {
        slackChanel = fileToChannel[fileId]
        ancestors = [getFileWithParent(fileId)]
      } else {
        // REQUEST TO SERVER AND SAVE TO CACHE
        ancestors = getAncestors(fileId)
        const ancestorIds = ancestors.map(({ parentId }) => parentId)
        const salesRecord = SalesRecords.findOne({ folderId: { $in: ancestorIds } })
        if (salesRecord) {
          slackChanel = salesRecord.slackChanel
        } else {
          const project = Projects.findOne({ folderId: { $in: ancestorIds } })
          project && (slackChanel = project.slackChanel)
        }
        slackChanel && (fileToChannel[fileId] = slackChanel)
      }
      if (slackChanel) {
        console.log(`--> Send message to slack channel ${slackChanel}`)
        sendAttachment({
          pretext: 'file is editing',
          title: _.first(ancestors).name,
          title_link: _.first(ancestors).webViewLink,
          channel: slackChanel,
        })
      }
    })
    changedFiles = {}
  }
})

SyncedCron.start()

WebApp.connectHandlers.use(bodyParser.json())
WebApp.connectHandlers.use('/notifications', (req, res ) => {
  drive.changes.list({
    pageToken,
    pageSize: 100,
  }, (error, result) => {
    pageToken = result.newStartPageToken
    result.changes.forEach(({ fileId, time, removed, file }) => {
      if (fileId && file && file.mimeType != 'application/vnd.google-apps.folder') {
        changedFiles[fileId] = {
          fileId,
          time,
          removed,
          file
        }
      }
    })
  })
  res.writeHead(200)
  res.end(`Hello world from: ${Meteor.release}`)
})
