import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { SlackMessages, People, ROLES } from '/imports/api/models/index'
import Projects from './projects'
import Tasks from '../tasks/tasks'

Meteor.publishComposite('MyProjects', () => ({
    find() {
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find()
        return Projects.find({'members': this.userId})
    },
    children: [
        {
            find({ stakeholders }) {
                if (stakeholders) {
                    const peopleIds = stakeholders.map(({ peopleId }) => peopleId)
                    return People.find({ _id: { $in: peopleIds } })
                }
            }
        }, {
            find({_id}) {
                return Tasks.find({parentId:_id, parentType:'project'})
            }
        }
    ]
}))

Meteor.publish('getNewProjects', function () {
    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find()
    return Projects.find({'members.userId': this.userId})
})


Meteor.publish('getNewProject', function (_id) {
    if (!Match.test(_id, String)) return this.ready()
    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find({_id})
    return Projects.find({_id, 'members.userId': this.userId})
})

Meteor.publish('project.slackMessages', function (projectId) {
  check(projectId, String)
  const project = Projects.findOne(projectId)
  if (!project) return this.ready()
  return SlackMessages.find({ channel: project.slackChanel }, {sort: { createdAt: -1 }})
})
