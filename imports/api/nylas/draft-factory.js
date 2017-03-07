import AccountStore from './account-store'
import Utils from './nylas-utils'


class DraftFactory {
    createDraft = (fields = {}) => {
        account = AccountStore.defaultAccount()
        if (!account) return Promise.reject(new Error('Could not get Nylas account info'))

        return Promise.resolve({
            body: fields.body || '',
            subject: fields.subject || '',
            clientId: fields.clientId || Utils.generateTempId(),
            from: [{name:'', email:account.email_address}],
            to: [],
            cc: [],
            bcc: [],
            date: new Date().getTime() / 1000,
            account_id: account.account_id
        })
    }
}

module.exports = new DraftFactory()