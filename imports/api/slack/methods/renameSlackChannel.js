import {Meteor} from 'meteor/meteor'
import slackClient from '../restful'

Meteor.methods({
    renameSlackChannel({id, name, isPrivate}) {
        check(id, String)
        check(name, String)
        check(isPrivate, Match.Maybe(Boolean))

        const renameChannel = slackClient[isPrivate ? 'groups' : 'channels'.rename]

        let response = renameChannel({ name, channel:id })
        if (response.data.ok) {
            const data = response.data[isPrivate ? 'group' : 'channel']
            return {
                id: data.id,
                name: data.name,
                isPrivate
            }
        }

        if (!response.data.ok) {
            // RETRY WITH UNIQUE NAME
            name = `${name}-${Random.id()}`
            response = renameChannel({ name, channel:id })
            if (response.data.ok) {
                const data = response.data[isPrivate ? 'group' : 'channel']
                return {
                    id: data.id,
                    name: data.name,
                    isPrivate
                }
            }
        }
    }
})
