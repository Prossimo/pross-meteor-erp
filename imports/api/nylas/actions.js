import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadContacts',
    'loadFolders',
    'loadLabels',
    'loadThreads',
    'loadMessages',

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