import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import RegExpUtils from './RegExpUtils'
import {NylasAccounts} from '../models/nylasaccounts/nylas-accounts'

class AccountStore extends Reflux.Store {
    constructor() {
        super();

        this._accounts = [];

        this.listenTo(Actions.changedAccounts, this.onChangedAccounts)
    }

    onChangedAccounts = () =>{
        this.trigger()
        Actions.loadCategories()
    }
    accounts() {
        this._accounts = NylasAccounts.find({userId:Meteor.userId()}).fetch()

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
            return _.findWhere(this.accounts(), {accountId: accountId})

        return this.defaultAccount()
    }

    tokenForAccountId(accountId) {
        const account = this.accountForAccountId(accountId)

        return account ? account.accessToken : null
    }
}

module.exports = new AccountStore()
