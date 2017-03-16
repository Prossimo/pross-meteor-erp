import _ from 'underscore'
import Reflux from 'reflux'
import queryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import ChangeUnreadTask from './tasks/change-unread-task'

class MessageStore extends Reflux.Store {
    constructor() {
        super();


        this._registerListeners();
        this._setStoreDefaults();
    }

    _setStoreDefaults() {
        this._currentThread = null;
        this._messages = [];
        this._messagesExpanded = {};
        this._loading = false;
    }

    _registerListeners() {
        this.listenTo(Actions.loadMessages, this._onLoadMessages);
        this.listenTo(Actions.toggleMessageExpanded, this._onToggleMessageExpanded);
        this.listenTo(Actions.toggleAllMessagesExpanded, this._onToggleAllMessagesExpanded);
        this.listenTo(Actions.toggleHiddenMessages, this._onToggleHiddenMessages);
    }

    _onLoadMessages(thread) {
        if(!thread || !thread.account_id) return;

        this._loading = true;
        this.trigger();

        const query = queryString.stringify({thread_id: thread.id});
        NylasAPI.makeRequest({
            path: `/messages?${query}`,
            method: 'GET',
            accountId: thread.account_id
        }).then((result) => {
            //console.log("Nylas get messages result", result);

            this._messages = result;

            this._messages.sort((m1, m2)=>m1.date-m2.date)

            this._loading = false;

            this._expandMessagesToDefault();


            if(this._currentThread.unread) {
                markAsReadId = this._currentThread.id
                setTimeout(()=>{
                    if(markAsReadId!=this._currentThread.id || !this._currentThread.unread) return

                    t = new ChangeUnreadTask({thread:this._currentThread, unread:false})
                    Actions.queueTask(t)
                }, 2000)
            }


            this.trigger();
        })

        this._currentThread = thread;
    }

    _onToggleMessageExpanded(id) {
        message = _.findWhere(this._messages, {id})
        if (!message) return;

        if (this._messagesExpanded[id])
            this._collapseMessage(message);
        else
            this._expandMessage(message);
        this.trigger();
    }

    _onToggleAllMessagesExpanded() {
        if (this.hasCollapsedMessages())
            this._messages.forEach((message) => this._expandMessage(message));
        else
            [...-1].this._messages.forEach((message) => this._collapseMessage(message));
        this.trigger();
    }

    _onToggleHiddenMessages() {
        this._showingHiddenMessages = !this._showingHiddenMessages
        this._expandMessagesToDefault()
        this._fetchExpandedAttachments(this._messages)
        this.trigger()
    }
    _expandMessagesToDefault() {
        visibleMessages = this.messages()

        visibleMessages.forEach((message, idx)=>{
            if(message.unread || message.draft || idx==visibleMessages.length - 1)
                this._messagesExpanded[message.id] = "default"
        })

    }
    _expandMessage(message) {
        this._messagesExpanded[message.id] = 'explicit';
        this._fetchExpandedAttachments([message]);
    }

    _collapseMessage(message) {
        delete this._messagesExpanded[message.id];
    }

    hasCollapsedMessages() {
        return _.size(this._messagesExpanded) < this._messages.length;
    }
    _fetchExpandedAttachments(messages) {
        /*policy = PlanckEnv.config.get('core.attachments.downloadPolicy')
         if(policy === 'manually') return;*/

        for (message of messages) {
            if (!this._messagesExpanded[message.id]) continue;
            for (file of message.files)
                Actions.fetchFile(file)
        }
    }

    messages() {
        return this._messages;
    }

    loading() {
        return this._loading;
    }

    currentThread() {
        return this._currentThread;
    }

    messagesExpanded() {
        return _.clone(this._messagesExpanded);
    }


}

module.exports = new MessageStore()
