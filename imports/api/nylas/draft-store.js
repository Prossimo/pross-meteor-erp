import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import DraftFactory from './draft-factory'

ComposeType = {
    Creating: 'creating',
    Replying: 'replying',
    ReplyingAll: 'replying all',
    Forwarding: 'forwarding'
}
class DraftStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.composeNewBlankDraft, this.composeNewBlankDraft)

        this._drafts = []
        this._draftsSending = {}

        this._currentDraft = null

        this.state = {
            modal: false,
            composeType: null
        }
    }

    composeNewBlankDraft(clientId) {
        DraftFactory.createDraft({clientId}).then((draft)=>{
            this._drafts.push(draft)

            this.state = {
                modal: true,
                clientId: clientId
            }

            this._currentDraft = draft

            this.trigger()
        })
    }

    draftForClientId(clientId) {
        return _.findWhere(this._drafts, {clientId})
    }

    changeDraftForClientId(clientId, data={}) {console.log("Data from composer view", data)
        let draft = this.draftForClientId(clientId)

        draft = _.extend(draft, data)

        console.log(this._drafts)
    }
}

module.exports = new DraftStore()
