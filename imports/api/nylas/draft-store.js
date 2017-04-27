import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import DraftFactory from './draft-factory'
import SendDraftTask from './tasks/send-draft-task'
import NylasUtils from './nylas-utils'
import NylasAPI from './nylas-api'
import {SalesRecords, SlackMails} from '../models'
import { getSlackUsername, getAvatarUrl } from '../lib/filters'

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

    _onComposeNew = ({salesRecordId, modal = true, show = true} = {}) => {
        DraftFactory.createDraft().then((draft) => {
            draft.salesRecordId = salesRecordId
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: modal,
                show: show
            }

            this.trigger()
        })
    }

    _onComposeReply = ({message, type, modal, salesRecordId}) => {
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
                draft.salesRecordId = salesRecordId
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


    _onComposeForward = ({message, modal, salesRecordId}) => {
        DraftFactory.createDraftForForward({message}).then((draft) => {
            draft.salesRecordId = salesRecordId
            this._drafts.push(draft)

            this._draftsViewState[draft.clientId] = {
                clientId: draft.clientId,
                modal: modal,
                show: true
            }

            this.trigger()
        })
    }

    createDraftForQuoteEmail = (data = {}) => {
        return new Promise((resolve, reject) => {
            DraftFactory.createDraft(data).then((draft) => {

                this._drafts.push(draft)

                this._draftsViewState[draft.clientId] = {
                    clientId: draft.clientId
                }

                resolve(draft)
            })
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

    _onSendDraftSuccess = ({message, clientId} = {}) => {
        const draft = this.draftForClientId(clientId)
        console.log('_onSendDraftSuccess', message, clientId, draft)

        const salesRecordId = draft.salesRecordId
        if (salesRecordId) {    // Update conversations for sales record
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

            const salesRecord = SalesRecords.findOne({_id:salesRecordId})
            if(!salesRecord || typeof salesRecord.slackChanel === 'undefined') return;

            let thread_ts = null
            if(draft.thread_id) {
                const slackMail = SlackMails.findOne({thread_id: draft.thread_id})
                if(slackMail) thread_ts = slackMail.thread_ts
            }
            const params = {
                username: getSlackUsername(Meteor.user()),
                icon_url: getAvatarUrl(Meteor.user()),
                attachments: [
                    {
                        "color": "#36a64f",
                        "text": `${message.body}`
                    }
                ],
                thread_ts: thread_ts
            };

            console.log(params)
            const from = message.from[0].email
            let to = []
            message.to.forEach((c)=>{to.push(c.email)})
            message.cc.forEach((c)=>{to.push(c.email)})
            message.bcc.forEach((c)=>{to.push(c.email)})
            const slackText = `Email ${message.subject} was sent from ${message.from[0].email} to ${to.join(', ')}`;

            Meteor.call("sendBotMessage", salesRecord.slackChanel, slackText, params, (err,res)=>{
                console.log(err,res)
                if(!err && res.ts) {
                    Meteor.call("insertSlackMail", {thread_id:message.thread_id,thread_ts:res.ts})
                }
            });
        }

        this.removeDraftForClientId(clientId)
        this.trigger()
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

    changeDraftForClientId(clientId, data = {}) {
        let draft = this.draftForClientId(clientId)

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
