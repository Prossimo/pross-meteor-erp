import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    setTopicToSlackChannel({id, isPrivate, topic}) {
        check(id, String)
        check(isPrivate, Match.Maybe(Boolean))
        check(topic, String)

        const setTopic = slackClient[isPrivate ? 'groups' : 'channels'].setTopic

        return setTopic({
            channel: id,
            topic
        })
    }
})
