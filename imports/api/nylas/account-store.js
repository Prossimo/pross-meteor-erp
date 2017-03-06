import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import RegExpUtils from './RegExpUtils'


class AccountStore extends Reflux.Store {
    constructor() {
        super();

        this.data = [];
        this.loading = false;
    }

}

module.exports = new AccountStore()
