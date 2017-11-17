import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { SlackMessages, People, ROLES, Projects, Tasks, Events, Quotes, Messages, Files, Conversations, Threads } from '/imports/api/models/index'

/*Meteor.publishComposite('projects.mine', () => ({
    find() {
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return Projects.find()
        return Projects.find({'members.userId': this.userId})
    },
    children: [
        {
            find({ stakeholders }) {
                if (stakeholders) {
                    const peopleIds = stakeholders.map(({ peopleId }) => peopleId)
                    return People.find({ _id: { $in: peopleIds } })
                }
            }
        }
    ]
}))*/

Meteor.publish('projects.mine', function() {
    if(!this.userId) return this.ready()

    if(Roles.userIsInRole(this.userId, [ROLES.ADMIN]))
        return Projects.find()

    return Projects.find({'members.userId': this.userId})
})

Meteor.publishComposite('projects.one', function (_id) {
    check(_id, String)
    if (!Match.test(_id, String)) return this.ready()

    return {
        find() {
            return Projects.find({_id})
        },

        children: [{
            find({_id}) {
                return Events.find({projectId:_id})
            }
        },{
            find({slackChanel}) {
                if(slackChanel) {
                    return SlackMessages.find({channel: slackChanel})
                }
            }
        },{
            find({_id}) {
                return Quotes.find({projectId:_id})
            }
        },{
            find({_id}) {
                return Files.find({'metadata.projectId': _id})
            }
        },{
            find({_id}) {
                return Tasks.find({parentType:'project', parentId: _id})
            }
        },{
            find({conversationIds}) {
                if(conversationIds && conversationIds.length>0) {
                    return Conversations.find({_id: {$in: conversationIds}})
                }
            }
        },{
            find({conversationIds}) {
                if(conversationIds && conversationIds.length>0) {
                    return Threads.find({conversationId: {$in:conversationIds}})
                }
            },
            children: [{
                find({id}) {
                    return Messages.find({thread_id: id})
                }
            }]
        }]
    }
})

Meteor.publish('projects.slackMessages', function (projectId) {
  check(projectId, String)
  const project = Projects.findOne(projectId)
  if (!project) return this.ready()
  return SlackMessages.find({ channel: project.slackChanel }, {sort: { createdAt: -1 }})
})
