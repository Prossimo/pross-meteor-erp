const SlackBot = Npm.require('slackbots')


Meteor.startup(() => {
    //todo add reload ws connection
    const bot = new SlackBot({
        token: 'xoxb-143253157236-cBzs3iNbCDuxCOIHTPnI2LHG',
        name: 'prossimobot'
    })

    //todo add err ws connection cb

    bot.on('message', Meteor.bindEnvironment((data) => {
        if (data.type === 'message') {
            Meteor.call('parseSlackMessage', data)
        }
    }))

    //todo replace
    Meteor.methods({
        async sendBotMessage(channel, msg, params) {
            if (params && params.username) params.as_user = false


            try {
                return await bot.postMessage(channel, msg, params).then((body) => {
                    console.log(body)
                    return body
                }).catch((err) => {
                    console.log(err)
                    throw Meteor.Error(err)
                })
            } catch (err) {
                console.log(`ERROR: ${err.message}`)
                throw err
            }
        }
    })
})