import '../models/users/users'

import Utils from './nylas-utils'

class DraftFactory {
    createDraft = (fields = {}) => {
        const currentUser = Meteor.user();
        if (!currentUser) return Promise.reject(new Error('Could not found current user'))

        nylasAccount = currentUser.defaultNylasAccount()
        if (!nylasAccount) return Promise.reject(new Error('Could not get Nylas account info'))

        return Promise.resolve({
            body: fields.body || '',
            subject: fields.subject || '',
            clientId: fields.clientId || Utils.generateTempId(),
            from: [nylasAccount.fromForMailing()],
            date: new Date().getTime() / 1000,
            account_id: nylasAccount.id
        })
    }
}

module.exports = new DraftFactory()