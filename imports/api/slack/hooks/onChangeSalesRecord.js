import {SalesRecords} from '/imports/api/models'
import slackClient from '../restful'
import {Random} from 'meteor/random'
import {Meteor} from 'meteor/meteor'

SalesRecords.before.update((userId, doc, fieldNames, modifier) => {
    if (fieldNames.includes('name')) {
        if (modifier.$set && modifier.$set.name) {
            const {name, slackChanel} = doc
            let newName = `d-${modifier.$set.name}`
            if (newName !== name) {
                Meteor.defer(() => {
                    const updateSlackChannelName = (slackChannelName) => {
                        SalesRecords.update(doc._id, {$set: {slackChannelName}})
                    }
                    const {data: {ok}} = slackClient.channels.rename({
                        name: newName,
                        channel: slackChanel,
                    })
                    if (!ok) {
                        newName = `${newName}-${Random.id()}`
                        const {data: {ok}} = slackClient.channels.rename({
                            name: newName,
                            channel: slackChanel,
                        })

                        if (ok) updateSlackChannelName(newName)
                    } else {
                        updateSlackChannelName(newName)
                    }
                })
            }
        }
    }
})
