import _ from 'underscore';
import '../models/users/users';
import moment from 'moment-timezone';

module.exports = NylasUtils = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    isMe: (email) => {
        const currentUser = Meteor.user();
        if (!currentUser) return false;

        return currentUser.email() == email;
    },

    isFromMe: (message) => {
        return message.from[0] && NylasUtils.isMe(message.from[0].email);
    },

    displayName: (participant) => {
        return participant.name && participant.name.length ? participant.name : participant.email;
    },
    getParticipantsNamesString: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => {
                return !NylasUtils.isMe(participant.email);
            });
            return others.map((participant) => {
                return NylasUtils.displayName(participant);
            }).join(', ');
        } else {
            return participants.map((participant) => {
                return NylasUtils.displayName(participant);
            }).join(', ');
        }
    },

    getParticipantsNamesArray: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => {
                return !NylasUtils.isMe(participant.email);
            });
            return others.map((participant) => {
                return NylasUtils.displayName(participant);
            });
        } else {
            return participants.map((participant) => {
                return NylasUtils.displayName(participant);
            });
        }
    },

    useFolder: () => {
        const currentUser = Meteor.user();
        if (!currentUser) return false;

        return currentUser.nylas && currentUser.nylas.organization_unit == 'folder';
    },

    shortTimeString: (time/*unixtimestamp*/) => {
        if (!time) return "";

        const diff = moment().diff(moment(time * 1000), 'days', true);

        let format;
        if (diff <= 1) {
            format = "h:mm a";
        } else if (diff > 1 && diff <= 365) {
            format = "MMM d";
        } else {
            format = "MMM D YYYY";
        }
        format = "MMM D YYYY";
        return moment(time * 1000).format(format);
    },

    fullTimeString: (time/*unixtimestamp*/) => {
        if(!time) return "";

        return moment(time * 1000).tz(NylasUtils.timezone).format("dddd, MMMM Do YYYY, h:mm:ss a z")
    },


    participantsForReplyAll: (message) => {
        excludedFroms = message.from.map((c) => c.email)
        excludeMeAndFroms = (cc) => {
            return _.reject(cc, (p) => NylasUtils.isMe(p.email) || _.contains(excludedFroms, p.email))
        }

        to = null
        cc = null

        if (NylasUtils.isFromMe(message)) {
            to = message.to
            cc = excludeMeAndFroms(message.cc)
        } else {
            if (message.reply_to.length)
                to = message.reply_to
            else
                to = message.from
            cc = excludeMeAndFroms([].concat(message.to, message.cc))
        }

        return {to, cc}
    },

    canReplyAll: (message) => {
        const {to, cc} = NylasUtils.participantsForReplyAll(message)
        return to.length > 1 || cc.length > 0
    },
    generateTempId: () => {
        s4 = ()=>{return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)}

        return 'local-' + s4() + s4() + '-' + s4()
    }

}