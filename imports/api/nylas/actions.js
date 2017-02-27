import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadFolders',
    'loadLabels',
    'loadThreads',
    'loadMessages',

    'toggleMessageExpanded',
    'toggleAllMessagesExpanded',
    'toggleHiddenMessages',

    'fetchFile'
]);

module.exports = Actions;