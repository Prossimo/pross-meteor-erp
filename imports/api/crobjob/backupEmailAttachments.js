import request from 'request'
import { Meteor } from 'meteor/meteor'
import NylasAccounts from '/imports/api/models/nylasaccounts/nylas-accounts'

const attachmentsProgess = {} // key -> accountId, value -> latest attachment file position
const makeFileRequest = (accessToken, query) => {
  const baseURL = 'https://api.nylas.com/files'
  let queryURL = null
  if (query) {
    const queryStr = Object.keys(query).map(key => [key, query[key]].join('=')).join('&')
    queryURL = `${baseURL}?${queryStr}`
  } else {
    queryURL = baseURL
  }
  return Meteor.wrapAsync(callback => {
    request.get(queryURL, {
      auth: {
        user: accessToken,
        password: '',
        sendImmediately: '',
      }
    }, (error, res, body) => callback(error, body))
  })()
}
const accounts = NylasAccounts.find({}).fetch()
console.log(accounts)
