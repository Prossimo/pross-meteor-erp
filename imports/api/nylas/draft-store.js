import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'


class DraftStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.composeNewBlankDraft, this.composeNewBlankDraft)

        this.composeNewMail = false
    }

    composeNewBlankDraft() {
        this.composeNewMail = true
        this.trigger()
    }
}

module.exports = new DraftStore()
