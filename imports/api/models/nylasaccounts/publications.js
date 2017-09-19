import {Meteor} from 'meteor/meteor'
import NylasAccounts from './nylas-accounts'

Meteor.publish('nylasaccounts.all', () => NylasAccounts.find({}))