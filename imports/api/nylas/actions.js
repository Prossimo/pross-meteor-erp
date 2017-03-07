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

    'composeReply',
    'composeForward',
    'composeNewBlankDraft',

    'sendDraft'
]);

module.exports = Actions;