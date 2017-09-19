import {Meteor} from 'meteor/meteor'
import Files from './files'


Meteor.publish('files.byProject', (projectId) => {
    check(projectId, String)

    return Files.find({'metadata.projectId': projectId})
})