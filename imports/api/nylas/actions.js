import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadContacts',         // accountId
    'loadFolders',          // accountId
    'loadLabels',           // accountId
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

    'queueTask'
]);

module.exports = Actions;