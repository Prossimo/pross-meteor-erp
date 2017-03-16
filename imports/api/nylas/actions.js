import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'changedAccounts',
    'changedThreads',
    'loadContacts',         // accountId
    'loadThreads',          // folder, {page, search}
    'loadMessages',         // thread

    'toggleMessageExpanded',
    'toggleAllMessagesExpanded',
    'toggleHiddenMessages',

    'fetchFile',

    'composeNew',
    'composeReply',
    'composeForward',

    'sendDraft',
    'sendDraftSuccess',
    'sendDraftFailed',

    'queueTask',
    'queueTasks'
]);

module.exports = Actions;