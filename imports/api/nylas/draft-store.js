import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import DraftFactory from './draft-factory'
import SendDraftTask from './tasks/send-draft-task'
import NylasUtils from './nylas-utils'

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
        this.listenTo(Actions.composeReply, this._onComposeReply)
        this.listenTo(Actions.composeForward, this._onComposeForward)
        this.listenTo(Actions.sendDraft, this._onSendDraft)
        this.listenTo(Actions.sendDraftSuccess, this._onSendDraftSuccess)
        this.listenTo(Actions.sendDraftFailed, this._onSendDraftFailed)

        this._drafts = []
        this._draftsSending = {}
        this._draftsViewState = {}
    }

    _onComposeNew = () => {
        DraftFactory.createDraft().then((draft)=>{
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: true,
                show: true
            }

            this.trigger()
        })
    }

    _onComposeReply = ({thread, message, type, modal}) =>{
        if(!thread || !message) return

        threadId = thread.id
        messageId = message.id

        let existingDraft = this.draftForReply(threadId, messageId)

        if(existingDraft) {
            const {to, cc} = type == 'reply-all' ? NylasUtils.participantsForReplyAll(message) : NylasUtils.participantsForReply(message)
            existingDraft.to = to
            existingDraft.cc = cc

            this._draftsViewState[existingDraft.clientId] = {
                clientId: existingDraft.clientId,
                modal: modal,
                show: true
            }
            this.trigger()
        } else {
            DraftFactory.createDraftForReply({thread, message, type}).then((draft)=>{
                this._drafts.push(draft)

                this._draftsViewState[draft.clientId] = {
                    clientId: draft.clientId,
                    modal: modal,
                    show: true
                }

                this.trigger()
            })
        }
    }


    _onComposeForward = ({thread, message, modal}) => {
        DraftFactory.createDraftForForward({thread, message}).then((draft)=>{
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: modal,
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

    draftForReply(threadId, messageId) {
        return _.findWhere(this._drafts, {thread_id: threadId, reply_to_message_id:messageId})
    }

    changeDraftForClientId(clientId, data={}) {
        let draft = this.draftForClientId(clientId)

        draft = _.extend(draft, data)
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
