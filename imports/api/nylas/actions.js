import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'changedAccounts',
    'changedThreads',
    'changedMessages',
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

    'saveDraft',
    'saveDraftSuccess',

    'queueTask',
    'queueTasks',

    'changedConversations',
    'fetchSalesRecordThreads',

    'showTaskModal'
])

export default Actions