import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'changedAccounts',
    'changedThreads',
    'loadContacts',         // accountId
    'loadThreads',          // folder, {page, search}
    'fetchNewThreads',
    'loadMessages',         // thread
    'searchThreads',         // thread

    'resetContacts',

    'toggleMessageExpanded',
    'toggleAllMessagesExpanded',
    'toggleHiddenMessages',

    'selectAttachment',
    'addAttachment',
    'removeAttachment',

    'fetchImage',
    'downloadFile',
    'downloadFiles',
    'abortDownloadFile',
    'removeFile',
    'downloadStateChanged',

    'composeNew',
    'composeReply',
    'composeForward',

    'sendDraft',
    'sendDraftSuccess',
    'sendDraftFailed',

    'queueTask',
    'queueTasks',

    'changedConversations',
    'fetchSalesRecordThreads',

    'showTaskModal'
])

module.exports = Actions