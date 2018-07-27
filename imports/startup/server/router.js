import _ from 'underscore'
import bodyParser from 'body-parser'
import {Picker} from 'meteor/meteorhacks:picker'
import NylasAPI from '/imports/api/nylas/nylas-api'
import {Threads, Messages, NylasAccounts} from '/imports/api/models'

Picker.middleware(bodyParser.json())
Picker.middleware(bodyParser.urlencoded({extended: false}))

Picker.filter((req, res) => req.method == 'POST').route('/api/voice', (params, req, res, next) => {

    const twilio = require('twilio')
    const config = require('../../api/config')

    const twiml = new twilio.TwimlResponse()

    twiml.dial(req.body.number, {
        callerId: config.twilio.phoneNumber
    })

    res.writeHead(200, {
        'Content-Type': 'text/xml'
    })

    res.end(twiml.toString())
})

Picker.filter((req, res) => req.method == 'GET').route('/api/download', (params, req, res, next) => {
    const query = params.query
    const request = require('request')

    request.get(`https://api.nylas.com/files/${query.file_id}/download`, {
        auth: {
            user: query.access_token,
            password: '',
            sendImmediately: true
        }
    })
        .on('response', (response) => {
            if (response.statusCode == 200) {
                const clean = require('../../api/lib/validate-http-headers')
                let headers = {
                    'Content-Disposition': response.headers['content-disposition'],
                    'Content-Type': response.headers['content-type'],
                    'Content-Length': response.headers['content-length']
                }
                headers = clean(headers)

                res.writeHead(200, headers)
            } else {
                res.write('Can not download file')
            }

        })
        .pipe(res)
})

const bound = Meteor.bindEnvironment((callback) => callback())
Picker.route('/callback/nylas/message.created', (params, req, res, next) => {
    const query = params.query

    console.log('=========> /callback/nylas/message.created WEBHOOK')
    const deltas = req.body.deltas
    if (deltas && deltas.length) {
        const data = deltas[0]
        if (data && data.object_data) {
            console.log('>>> delta object', data.object_data)
            const account_id = data.object_data.account_id
            const message_id = data.object_data.id
            const attributes = data.object_data.attributes
            if (attributes) {
                const thread_id = attributes.thread_id

                if (account_id && thread_id && message_id) {
                    const nylasAccount = NylasAccounts.findOne({accountId: account_id})
                    if (nylasAccount) {
                        const {accessToken} = nylasAccount

                        const auth = {
                            user: accessToken,
                            pass: '',
                            sendImmediately: true
                        }
                        NylasAPI.makeRequest({
                            path: `/threads/${thread_id}`,
                            method: 'GET',
                            auth
                        })
                            .then((thread) => {
                                NylasAPI.makeRequest({
                                    path: `/messages/${message_id}`,
                                    method: 'GET',
                                    auth
                                })
                                    .then((message) => {
                                        bound(() => {
                                            let mentions
                                            const existingThread = Threads.findOne({id: thread_id})
                                            if (existingThread) {
                                                const updateData = {
                                                    ...thread
                                                }
                                                if (thread.unread) updateData.readByUsers = []
                                                Threads.update({id: thread_id}, {$set: updateData})

                                                //console.log('server router existingThread', existingThread)

                                                const members = [existingThread.getAssignee()].concat(existingThread.getFollowers())
                                                mentions = _.uniq(members.filter(m => m&&m.slack!=null).map(({slack}) => slack), false, ({id}) => id)

                                                //console.log('mentions', mentions)

                                            } else {
                                                Threads.insert(thread)
                                            }

                                            const existingMessage = Messages.findOne({id: message.id})
                                            if (!existingMessage) {
                                                Messages.insert(message)
                                            }

                                            if(nylasAccount.isTeamAccount) {
                                                Meteor.call('sendMailToSlack', message, {mentions})
                                                // upload files to slack
                                                /*if (message.files && message.files.length) {
                                                    const promises = message.files.map(file => new Promise((resolve, reject) => {
                                                            const filepath = `/Volumes/MACDATA/uploads/${file.filename}`
                                                            console.log('===> filepath', filepath)
                                                            const request = require('request')
                                                            const progress = require('request-progress')

                                                            progress(request.get(`${config.nylas.apiRoot}/files/${file.id}/download`, {auth}), {throtte: 250})
                                                                .on('progress', (progress) => {console.log('Nylas file download progress', progress)})
                                                                .on('end', () => {console.log('Nylas file download end')
                                                                    resolve(fs.createReadStream(filepath))
                                                                })
                                                                .on('error', (err) => {
                                                                    console.error('=====> Nylas file download error', err)
                                                                    reject(err)
                                                                })
                                                                .pipe(fs.createWriteStream(filepath))
                                                        })
                                                    )
                                                    Promise.all(promises).then(files => {
                                                        bound(() => {
                                                            Meteor.call('sendMailToSlack', message, files)
                                                        })
                                                    }).catch(err => {
                                                        console.error(err)
                                                        bound(() => {
                                                            Meteor.call('sendMailToSlack', message)
                                                        })
                                                    })
                                                } else {
                                                    Meteor.call('sendMailToSlack', message)
                                                }*/
                                            }
                                        })
                                    })
                                    .catch((err) => {
                                        console.error(err)
                                    })
                            })
                            .catch((err) => {
                                console.error(err)
                            })
                    }


                }
            }
        }
    }
    res.end(query.challenge)   // For Nylas Web Hook verification https://docs.nylas.com/reference#creating-a-webhook
})