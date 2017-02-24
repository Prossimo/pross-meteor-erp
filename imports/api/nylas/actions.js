import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadFolders',
    'loadLabels',
    'loadThreads',
    'loadMessages'
]);

module.exports = Actions;