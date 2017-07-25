import {Meteor} from 'meteor/meteor'
import {channels} from '../restful'

Meteor.methods({
    getSlackChannels(){
        const {data} = channels.list()
        if (!data.ok) throw new Meteor.Error('channels.list API failed')
        return data.channels
    }
})
