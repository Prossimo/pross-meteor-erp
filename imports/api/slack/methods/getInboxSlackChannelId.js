import {Meteor} from 'meteor/meteor'
import find from 'lodash/find'
import {channels} from '../restful'

Meteor.methods({
    getInboxSlackChannelId(){
        const channelsListRes = channels.list()
        if (channelsListRes.statusCode != 200 || !channelsListRes.data.ok || !channelsListRes.data.channels) throw new Meteor.Error('Could not get slack channel')

        const chls = channelsListRes.data.channels
        const inboxChannel = find(chls, {name: 'inbox'})
        if (!inboxChannel) {
            const channelsCreateRes = channels.create({name: 'inbox', validate: true})
            if (channelsCreateRes.statusCode != 200 || !channelsCreateRes.data.ok) return null
            return channelsCreateRes.data.channel.id
        } else {
            return inboxChannel.id
        }
    }
})
