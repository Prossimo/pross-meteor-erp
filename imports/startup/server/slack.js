//const SlackBot = Npm.require('slackbots')
//import {SlackMails} from '/imports/api/models'

//const bound = Meteor.bindEnvironment(callback => callback())

//Meteor.startup(() => {
    ////todo add reload ws connection
    //const bot = new SlackBot({
        //token: 'xoxb-143253157236-cBzs3iNbCDuxCOIHTPnI2LHG',
        //name: 'prossimobot'
    //})

    ////todo add err ws connection cb

    //bot.on('message', Meteor.bindEnvironment((data) => {
        //if (data.type === 'message') {
            //Meteor.call('parseSlackMessage', data)
        //}
    //}))

    ////todo replace
    //Meteor.methods({
        //async sendBotMessage(channel, msg, params, thread_id) {
            //check(channel, String)
            //check(msg, String)
            //check(params, Object)
            //check(thread_id, Match.Maybe(String))

            //if (params && params.username) params.as_user = false


            //try {
                //return await bot.postMessage(channel, msg, params).then((body) => {
                    //console.log(body)

                    //if(thread_id) {
                        //bound(() => {
                            //const existingSlackMail = SlackMails.findOne({thread_id})
                            //if(!existingSlackMail) {
                                //SlackMails.insert({thread_id, thread_ts: body.ts})
                            //}
                        //})
                    //}
                    //return body
                //}).catch((err) => {
                    //console.error(err)
                    //throw Meteor.Error(err)
                //})
            //} catch (err) {
                //console.error(err)
                //throw Meteor.Error(err)
            //}
        //}
    //})
//})
