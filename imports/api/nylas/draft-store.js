import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import DraftFactory from './draft-factory'
import SendDraftTask from './tasks/send-draft-task'
import NylasUtils from './nylas-utils'
import NylasAPI from './nylas-api'

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

    _onComposeNew = (salesRecordId) => {
        DraftFactory.createDraft().then((draft) => {
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: true,
                show: true
            }

            this.trigger()
        })
    }

    _onComposeReply = ({message, type, modal}) => {
        if (!message) return


        let existingDraft = this.draftForReply(message.thread_id, message.id)

        if (existingDraft) {
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
            DraftFactory.createDraftForReply({message, type}).then((draft) => {
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


    _onComposeForward = ({message, modal}) => {
        DraftFactory.createDraftForForward({message}).then((draft) => {
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: modal,
                show: true
            }

            this.trigger()
        })
    }

    _onSendDraft(clientId, options = {}) {
        this._draftsSending[clientId] = true

        Actions.queueTask(new SendDraftTask(clientId, options))

        this._draftsViewState[clientId] = {
            modal: false,
            show: false
        }
        this.trigger()
    }

    _onSendDraftSuccess = ({message, clientId, salesRecordId} = {}) => {
        console.log('_onSendDraftSuccess', message, clientId, salesRecordId)
        this.removeDraftForClientId(clientId)
        this.trigger()

        if (salesRecordId) {
            NylasAPI.makeRequest({
                path: `/threads/${message.thread_id}`,
                method: 'GET',
                accountId: message.account_id
            }).then((thread) => {
                if (thread) {

                    Meteor.call('insertOrUpdateThreadWithMessage', salesRecordId, thread, message, (err, res) => {
                        Actions.changedConversations(salesRecordId)
                    })
                }
            })
        }
    }

    _onSendDraftFailed = ({threadId, clientId, errorMessage} = {}) => {
        alert(`Failed to send draft with clientId="${clientId}" because of "${errorMessage}"`)
        this.trigger()
    }

    draftForClientId(clientId) {
        return _.findWhere(this._drafts, {clientId})
    }

    draftForReply(threadId, messageId) {
        return _.findWhere(this._drafts, {thread_id: threadId, reply_to_message_id: messageId})
    }

    changeDraftForClientId(clientId, data = {}, shouldIncludeSignature = null) {
        let draft = this.draftForClientId(clientId)

        if (shouldIncludeSignature) data.body = DraftFactory.getBodyWithSignature(data.body, draft.account_id)
        draft = _.extend(draft, data)
    }

    removeDraftForClientId(clientId) {
        const draft = this.draftForClientId(clientId)

        if (!draft) return

        const index = _.indexOf(this._drafts, draft)

        if (index > -1)
            this._drafts.splice(index, 1)

        if (this._draftsViewState[clientId]) delete this._draftsViewState[clientId]

        this.trigger()
    }

    isSendingDraft(clientId) {
        return this._draftsSending[clientId] ? true : false
    }

    draftViewStateForModal() {
        states = _.values(this._draftsViewState)

        stateForModal = _.findWhere(states, {modal: true})

        return stateForModal
    }


}

module.exports = new DraftStore()
