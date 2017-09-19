import {Meteor} from 'meteor/meteor'
import Users from './users'

Meteor.publish('users.all', () => Users.find({}, {
        fields: {
            'services': 0
        }
    }))