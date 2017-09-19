import {Meteor} from 'meteor/meteor'
import Quotes from './quotes'

Meteor.publish('quotes.byProject', (projectId) => {
    check(projectId, String)

    return Quotes.find({projectId})
})