import {Meteor} from 'meteor/meteor'
import {channels, groups} from '../restful'

Meteor.methods({
    getSlackChannels(){
        let chls = []

        let res = channels.list()
        if (res.data.ok && res.data.channels) {
            chls = chls.concat(res.data.channels.map(channel => {
                channel.isPrivate = false
                return channel
            }))
        }

        res = groups.list()
        if (res.data.ok && res.data.groups) {
            chls = chls.concat(res.data.groups.map(channel => {
                channel.isPrivate = true
                return channel
            }))
        }

        return chls
    }
})
