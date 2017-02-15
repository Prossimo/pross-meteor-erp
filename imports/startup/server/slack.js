import  { SlackMessages } from '/imports/api/lib/collections';
const SlackBot = Npm.require('slackbots');
let SlackAPI = Meteor.npmRequire( 'node-slack' ),
    Slack    = new SlackAPI( Meteor.settings.private.slack.hookUrl );


Meteor.startup(() => {
    //todo add reload ws connection
    const bot = new SlackBot({
        token: Meteor.settings.private.slack.token,
        name: Meteor.settings.private.slack.bot
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
        sendMessage(chenal, msg){
            const params = {
                icon_emoji: ':cat:'
            };

            bot.postMessageToChannel(chenal, msg, params)
        },
    })
});