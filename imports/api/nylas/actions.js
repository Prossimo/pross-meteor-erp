import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadFolders',
    'loadLabels',
    'loadThreads',
    'loadMessages',

    'toggleMessageExpanded',
    'toggleAllMessagesExpanded',
    'toggleHiddenMessages',

    'fetchFile',

    'composeReply',
    'composeForward'
]);

module.exports = Actions;