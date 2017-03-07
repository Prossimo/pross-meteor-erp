import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import RegExpUtils from './RegExpUtils'


class AccountStore extends Reflux.Store {
    constructor() {
        super();

        this._accounts = [];



    }

    accounts() {
        const currentUser = Meteor.user();
        if (currentUser && currentUser.nylas) {
            this._accounts = [currentUser.nylas]
        }

        return this._accounts
    }
    defaultAccount() {
        const accounts = this.accounts()
        return accounts&&accounts.length ? accounts[0] : null
    }

    accountForEmail(email) {
        return _.findWhere(this.accounts(), {email_address:email})
    }

    accountForAccountId(accountId) {
        if(accountId)
            return _.findWhere(this.accounts(), {account_id: accountId})

        return this.defaultAccount()
    }

    tokenForAccountId(accountId) {
        const account = this.accountForAccountId(accountId)

        return account ? account.access_token : null
    }
}

module.exports = new AccountStore()
