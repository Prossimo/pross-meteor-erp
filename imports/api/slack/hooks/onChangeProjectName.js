import {Projects} from '/imports/api/models'
import slackClient from '../restful'
import {Random} from 'meteor/random'
import {Meteor} from 'meteor/meteor'
import {prossDocDrive} from '/imports/api/drive'

Projects.before.update((userId, doc, fieldNames, modifier) => {
    if (fieldNames.includes('name')) {
        if (modifier.$set && modifier.$set.name) {

            const {name, slackChanel, folderId} = doc

            let newName = `p-${modifier.$set.name}`
            if (newName !== name) {

                // Slack channel rename
                Meteor.defer(() => {
                    const updateSlackChannelName = (slackChannelName) => {
                        Projects.update(doc._id, {$set:{slackChannelName}})
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

                        if(ok) updateSlackChannelName(newName)
                    } else {
                        updateSlackChannelName(newName)
                    }
                })

                // Rename google drive folder name
                if(folderId) {
                    Meteor.defer(() => {
                        prossDocDrive.updateFolderName.call({folderId, name: newName})
                    })
                }
            }
        }
    }
})

