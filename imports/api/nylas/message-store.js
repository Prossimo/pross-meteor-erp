import _ from 'underscore'
import Reflux from 'reflux'
import queryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import ChangeUnreadTask from './tasks/change-unread-task'
import {SalesRecords} from '/imports/api/models'
import NylasUtils from './nylas-utils'

class MessageStore extends Reflux.Store {
    constructor(salesRecord=null) {
        super()

        this._registerListeners()
        this._setStoreDefaults()

        if(salesRecord) {
            this.salesRecord = salesRecord
            this._messages = salesRecord.messages()
            this._messages.sort((m1, m2) => m1.date - m2.date)

            this._expandMessagesToDefault()
        }
    }

    _setStoreDefaults(messages) {
        this._currentThread = null
        this._messages = []
        this._messagesExpanded = {}
        this._loading = false

        this._expandMessagesToDefault()
    }

    _registerListeners() {
        this.listenTo(Actions.loadMessages, this._onLoadMessages)
        this.listenTo(Actions.toggleMessageExpanded, this._onToggleMessageExpanded)
        this.listenTo(Actions.toggleAllMessagesExpanded, this._onToggleAllMessagesExpanded)
        this.listenTo(Actions.toggleHiddenMessages, this._onToggleHiddenMessages)
        this.listenTo(Actions.changedConversations, this._onLoadConversations)
    }

    _onLoadMessages(thread) {

        this._loading = true

        if(!thread || !this._currentThread || thread.id !== this._currentThread.id) {
            this._messages = []
        }

        this._currentThread = thread
        this.trigger()


        if(!thread || !thread.account_id){
            this._loading = false
            return
        }
        const query = queryString.stringify({thread_id: thread.id})
        NylasAPI.makeRequest({
            path: `/messages?${query}`,
            method: 'GET',
            accountId: thread.account_id
        }).then((result) => {
            //console.log('onLoadMessage result',  result)
            if(result && thread.id === this._currentThread.id) {
                this._messages = result

                this._messages.sort((m1, m2) => m1.date-m2.date)

                this._loading = false

                this._expandMessagesToDefault()
                this._fetchExpandedAttachments(this._messages)


                if(this._currentThread.unread) {
                    const markAsReadId = this._currentThread.id
                    setTimeout(() => {
                        if(markAsReadId!=this._currentThread.id || !this._currentThread.unread) return

                        const t = new ChangeUnreadTask({thread:this._currentThread, unread:false})
                        Actions.queueTask(t)
                    }, 2000)
                }
            }
        }).finally(() => {
            this.trigger()
        })
    }

    _onLoadConversations(salesRecordId) {
        if(this.salesRecord && this.salesRecord._id==salesRecordId) {
            this._messages = SalesRecords.findOne({_id: salesRecordId}).messages()
            this._messages.sort((m1, m2) => m1.date - m2.date)

            this._loading = false
            this._expandMessagesToDefault()
            this._fetchExpandedAttachments(this._messages)

            this.trigger()
        }
    }

    _onToggleMessageExpanded(id) {
        const message = _.findWhere(this._messages, {id})

        if (!message) return

        if (this._messagesExpanded[id])
            this._collapseMessage(message)
        else
            this._expandMessage(message)
        this.trigger()
    }

    _onToggleAllMessagesExpanded() {
        if (this.hasCollapsedMessages())
            this._messages.forEach((message) => this._expandMessage(message))
        else
            [...-1].this._messages.forEach((message) => this._collapseMessage(message))
        this.trigger()
    }

    _onToggleHiddenMessages() {
        this._showingHiddenMessages = !this._showingHiddenMessages
        this._expandMessagesToDefault()
        this._fetchExpandedAttachments(this._messages)
        this.trigger()
    }
    _expandMessagesToDefault() {
        const visibleMessages = this.messages()

        visibleMessages.forEach((message, idx) => {
            if(message.unread || message.draft || idx==visibleMessages.length - 1)
                this._messagesExpanded[message.id] = 'default'
        })

    }
    _expandMessage(message) {
        this._messagesExpanded[message.id] = 'explicit'
        this._fetchExpandedAttachments([message])
    }

    _collapseMessage(message) {
        delete this._messagesExpanded[message.id]
    }

    hasCollapsedMessages() {
        return _.size(this._messagesExpanded) < this._messages.length
    }
    _fetchExpandedAttachments(messages) {
        /*policy = PlanckEnv.config.get('core.attachments.downloadPolicy')
         if(policy === 'manually') return;*/

        for (const message of messages) {
            if (!this._messagesExpanded[message.id]) continue
            for (const file of message.files) {
                if(NylasUtils.shouldDisplayAsImage(file)) {
                    Actions.fetchImage(_.extend(_.clone(file), {account_id: message.account_id}))
                }
            }
        }
    }

    messages() {
        return this._messages
    }

    loading() {
        return this._loading
    }

    currentThread() {
        return this._currentThread
    }

    messagesExpanded() {
        return _.clone(this._messagesExpanded)
    }

    addMessage(message) {
        this._messages.push(message)
        this.trigger()
    }

}

export const ConversationStore = MessageStore
module.exports = new MessageStore()
