import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    createSlackChannel({name, isPrivate}) {
        check(name, String)
        check(isPrivate, Match.Maybe(Boolean))

        const createChannel = isPrivate ? slackClient.groups.create : slackClient.channels.create

        let responseCreateChannel = createChannel({ name })
        if (responseCreateChannel.data.ok) {
            const data = responseCreateChannel.data[isPrivate ? 'group' : 'channel']
            return {
                id: data.id,
                name: data.name,
                isPrivate
            }
        }

        if (!responseCreateChannel.data.ok) {
            // RETRY WITH UNIQUE NAME
            name = `${name}-${Random.id()}`
            responseCreateChannel = createChannel({ name })
            if (responseCreateChannel.data.ok) {
                const data = responseCreateChannel.data[isPrivate ? 'group' : 'channel']
                return {
                    id: data.id,
                    name: data.name,
                    isPrivate
                }
            }
        }
    }
})
