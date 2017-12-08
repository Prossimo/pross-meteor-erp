import {SalesRecords} from '/imports/api/models'
import slackClient from '../restful'
import {Random} from 'meteor/random'
import {Meteor} from 'meteor/meteor'
import {prossDocDrive} from '/imports/api/drive'

SalesRecords.before.update((userId, doc, fieldNames, modifier) => {
    if (fieldNames.includes('name')) {
        if (modifier.$set && modifier.$set.name) {
            const {name, slackChannel, folderId} = doc
            const newName = `d-${modifier.$set.name}`
            const oldName = `d-${name}`
            if (newName !== oldName) {
                // Rename slack channel name
                Meteor.defer(() => {
                    slackChannel.name = newName
                    const newSlackChannel = Meteor.call('renameSlackChannel', slackChannel)
                    if(newSlackChannel) SalesRecords.update(doc._id, {$set: {slackChannel: newSlackChannel}})
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
