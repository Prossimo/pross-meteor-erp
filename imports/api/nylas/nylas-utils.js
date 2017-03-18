import _ from 'underscore';
import '../models/users/users';
import moment from 'moment-timezone';
import RegExpUtils from './RegExpUtils'
import AccountStore from './account-store'

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
    isValidContact: (contact) => {
        if (!contact.email) return false

        // The email regexp must match the /entire/ email address
        result = RegExpUtils.emailRegex().exec(contact.email)
        if (result && result instanceof Array)
            return result[0] == contact.email
        else return false
    },

    contactDisplayName: (participant) => {
        return participant.name && participant.name.length ? participant.name : participant.email;
    },

    contactDisplayFullname: (c) => { console.log(c)
        if (c.name && c.name.length)
            return `${c.name} <${c.email}>`

        return c.email
    },

    getParticipantsNamesString: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => {
                return !NylasUtils.isMe(participant.email);
            });
            return others.map((participant) => {
                return NylasUtils.contactDisplayName(participant);
            }).join(', ');
        } else {
            return participants.map((participant) => {
                return NylasUtils.contactDisplayName(participant);
            }).join(', ');
        }
    },

    getParticipantsNamesArray: (participants, excludeMe = true) => {
        if (excludeMe) {
            const others = participants.filter((participant) => {
                return !NylasUtils.isMe(participant.email);
            });
            return others.map((participant) => {
                return NylasUtils.contactDisplayName(participant);
            });
        } else {
            return participants.map((participant) => {
                return NylasUtils.contactDisplayName(participant);
            });
        }
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
        if (!time) return "";

        return moment(time * 1000).tz(NylasUtils.timezone).format("dddd, MMMM Do YYYY, h:mm:ss a z")
    },

    participantsForReply: (message) => {
        to = []
        cc = []
        if(NylasUtils.isFromMe(message)) {
            to = message.to
        } else if(message.reply_to.length) {
            to = this.reply_to
        } else {
            to = message.from
        }

        to = _.uniq(to, (p)=>p.email)

        return {to, cc}
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
        s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        }

        return 'local-' + s4() + s4() + '-' + s4()
    },
    canArchiveThreads: () => {
        return true;
    },
    canTrashThreads: () => {
        return true;
    },


    isForwardedMessage: ({body, subject} = {}) => {
        bodyForwarded = false
        bodyFwd = false
        subjectFwd = false

        if (body) {
            indexForwarded = body.search(/forwarded/i)
            bodyForwarded = indexForwarded >= 0 && indexForwarded < 250
            indexFwd = body.search(/fwd/i)
            bodyFwd = indexFwd >= 0 && indexFwd < 250
        }
        if (subject)
            subjectFwd = subject.slice(0, 3).toLowerCase() == "fwd"

        return bodyForwarded || bodyFwd || subjectFwd
    },

    isEmptyDraft: (draft) => {
        return (!draft.subject || draft.subject.length==0) &&
            (!draft.body || draft.body.length==0) &&
            (!draft.files || draft.files.length==0) &&
            (!draft.downloads || draft.downloads.length==0)

    },

    usesFolders: (accountOrId) => {
        let account;
        if(accountOrId instanceof Object) {
            account = accountOrId
        } else {
            account = AccountStore.accountForAccountId(accountOrId)
        }
        return account.organizationUnit == 'folder'
    },

    usesLabels: (accountOrId) => {
        let account;
        if(accountOrId instanceof Object) {
            account = accountOrId
        } else {
            account = AccountStore.accountForAccountId(accountOrId)
        }
        return account.organizationUnit == 'label'
    },

    displayTypeForCategory: (category) => {
        const account = AccountStore.accountForAccountId(category.account_id)

        return account.organizationUnit
    },

    hasNylasAccounts: () => {
        const accounts = AccountStore.accounts(); console.log(accounts)
        return accounts.length>0
    },

    subjectWithPrefix: (subject, prefix) => {
        if(subject.search(/fwd:/i) == 0)
            return subject.replace(/fwd:/i, prefix)
        else if(subject.search(/re:/i) == 0)
            return subject.replace(/re:/i, prefix)
        else
            return `${prefix} ${subject}`
    },

    defaultMe: (account) => {
        return {name:account.name || '', email:account.emailAddress}
    },

    replyAttributionLine: (message) => {
        return `On ${NylasUtils.formattedDateForMessage(message)}, ${message.from && message.from.length ? NylasUtils.contactDisplayFullname( message.from[0]) : ""} wrote:`
    },

    formattedDateForMessage: (message) => {
        return moment(message.date*1000).format("MMM D YYYY, [at] h:mm a")
    }

}