import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'changedAccounts',
    'changedThreads',
    'changedMessages',
    'changedDrafts',
    'loadContacts',         // accountId
    'loadThreads',          // folder, {page, search}
    'fetchNewThreads',
    'loadMessages',         // thread
    'searchThreads',         // thread
    'loadDrafts',          // folder, {page, search}
    'fetchNewDrafts',
    'searchDrafts',         // thread

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
    'composeDraft',

    'sendDraft',
    'sendDraftSuccess',
    'sendDraftFailed',

    'saveDraft',
    'saveDraftSuccess',
    'removeDraft',

    'queueTask',
    'queueTasks',

    'changedConversations',
    'fetchSalesRecordThreads',

    'showTaskModal'
])

export default Actions