import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import DraftFactory from './draft-factory'
import SendDraftTask from './tasks/send-draft-task'

ComposeType = {
    Creating: 'creating',
    Replying: 'replying',
    ReplyingAll: 'replying all',
    Forwarding: 'forwarding'
}
class DraftStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.composeNew, this._onComposeNew)
        this.listenTo(Actions.sendDraft, this._onSendDraft)
        this.listenTo(Actions.sendDraftSuccess, this._onSendDraftSuccess)
        this.listenTo(Actions.sendDraftFailed, this._onSendDraftFailed)

        this._drafts = []
        this._draftsSending = {}
        this._draftsViewState = {}
    }

    _onComposeNew(clientId) {
        DraftFactory.createDraft({clientId}).then((draft)=>{
            this._drafts.push(draft)

            this._draftsViewState[clientId] = {
                clientId: clientId,
                modal: true,
                show: true
            }

            this.trigger()
        })
    }

    _onSendDraft(clientId) {
        this._draftsSending[clientId] = true

        Actions.queueTask(new SendDraftTask(clientId))

        this._draftsViewState[clientId] = {
            modal: false,
            show: false
        }
        this.trigger()
    }

    _onSendDraftSuccess = ({message, clientId} = {}) =>{
        this.removeDraftForClientId(clientId)
        this.trigger()
    }

    _onSendDraftFailed = ({threadId, clientId, errorMessage} = {}) =>{
        alert(`Failed to send draft with clientId="${clientId}" because of "${errorMessage}"`)
        this.trigger()
    }

    draftForClientId(clientId) {
        return _.findWhere(this._drafts, {clientId})
    }

    changeDraftForClientId(clientId, data={}) {
        let draft = this.draftForClientId(clientId)

        draft = _.extend(draft, data)

        //console.log(this._drafts)
    }

    removeDraftForClientId(clientId) {
        const draft = this.draftForClientId(clientId)

        if(!draft) return

        const index = _.indexOf(this._drafts, draft)

        if(index > -1)
            this._drafts.splice(index, 1)

        if(this._draftsViewState[clientId]) delete this._draftsViewState[clientId]

        this.trigger()
    }

    isSendingDraft(clientId) {
        return this._draftsSending[clientId] ? true : false
    }

    draftViewStateForModal() {
        states = _.values(this._draftsViewState)

        stateForModal = _.findWhere(states, {modal:true})

        return stateForModal
    }


}

module.exports = new DraftStore()
