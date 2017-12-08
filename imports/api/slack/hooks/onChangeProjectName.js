import {Projects} from '/imports/api/models'
import slackClient from '../restful'
import {Random} from 'meteor/random'
import {Meteor} from 'meteor/meteor'
import {prossDocDrive} from '/imports/api/drive'

Projects.before.update((userId, doc, fieldNames, modifier) => {
    if (fieldNames.includes('name')) {
        if (modifier.$set && modifier.$set.name) {

            const {name, slackChannel, folderId} = doc

            const newName = `p-${modifier.$set.name}`
            const oldName = `p-${name}`
            if (newName !== oldName) {

                // Slack channel rename
                Meteor.defer(() => {
                    slackChannel.name = newName
                    const newSlackChannel = Meteor.call('renameSlackChannel', slackChannel)
                    if(newSlackChannel) Projects.update(doc._id, {$set:{slackChannel: newSlackChannel}})
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

