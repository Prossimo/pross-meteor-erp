import  { SlackMessages } from '/imports/api/lib/collections';
const SlackBot = Npm.require('slackbots');


Meteor.startup(() => {
    //todo add reload ws connection
    const bot = new SlackBot({
        token: "xoxb-143253157236-jMQdyGbxvdujhuNuhU6cJNYq",
        name: "prossimobot"
    });

    //todo add err ws connection cb

    bot.on('message', Meteor.bindEnvironment(function(data) {
        if(data.type === 'message'){

            data.createAt = new Date();
            SlackMessages.insert(data)
        }
    }));

    //todo replace
    Meteor.methods({
        sendBotMessage(channel, msg, params){
            if(params && params.username) params.as_user = false;

            bot.postMessage(channel, msg, params, err=>{
                console.log(err);
            })
        },
    })
});