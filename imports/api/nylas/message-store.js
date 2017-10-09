import _ from 'underscore'
import Reflux from 'reflux'
import queryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import ChangeUnreadTask from './tasks/change-unread-task'
import NylasUtils from './nylas-utils'
import ThreadStore from './thread-store'
import {Messages} from '/imports/api/models'

class MessageStoreClass extends Reflux.Store {
    constructor() {
        super()

        this._registerListeners()
        this._setStoreDefaults()
    }

    _setStoreDefaults(messages) {
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
        this.listenTo(ThreadStore, this._onThreadStoreChanged)
    }

    _onLoadMessages(thread) {
        const currentThread = ThreadStore.currentThread()


        if(!thread || !thread.account_id){
            return
        }

        //console.log(`===> Started load message for thread: ${thread.id} at ${new Date().getTime()}`)
        const query = queryString.stringify({thread_id: thread.id})
        NylasAPI.makeRequest({
            path: `/messages?${query}`,
            method: 'GET',
            accountId: thread.account_id
        }).then((result) => {//console.log('onLoadMessages result', result)
            //console.log(`===> Finished load message for thread: ${thread.id} at ${new Date().getTime()}`)

            if(result && result.length) {
                if(thread.id === currentThread.id) {

                    if(currentThread.unread) {
                        const markAsReadId = currentThread.id
                        setTimeout(() => {
                            if(markAsReadId!=currentThread.id || !currentThread.unread) return

                            const t = new ChangeUnreadTask({thread:currentThread, unread:false})
                            Actions.queueTask(t)
                        }, 2000)
                    }
                }
            }

        }).finally(() => {
            setTimeout(() => this.loadMessagesFromDB(), 500)
        })
    }

    _onThreadStoreChanged = () => {
        const thread = ThreadStore.currentThread()
        if(!thread) return
        subsCache.subscribe('messages.byThread', thread.id).onReady(() => {
            this.loadMessagesFromDB()
        })
    }

    loadMessagesFromDB() {
        const thread = ThreadStore.currentThread()
        if(!thread) return

        this._messages = _.uniq(Messages.find({thread_id:thread.id}, {sort:{created_at:1}}).fetch(), true, ({id}) => id)
        this._expandMessagesToDefault()
        this._fetchExpandedAttachments(this._messages)
        this.trigger()
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
        const visibleMessages = this._messages

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

    messages(cb) {
        return this._messages
    }

    loading() {
        return this._loading
    }

    currentThread() {
        return ThreadStore.currentThread()
    }

    messagesExpanded() {
        return _.clone(this._messagesExpanded)
    }

    addMessage(message) {
        this._messages.push(message)
        this.trigger()
    }

}

const MessageStore = new MessageStoreClass()
export default MessageStore
