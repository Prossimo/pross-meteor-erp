import Reflux from 'reflux'

const Actions = Reflux.createActions([
    'loadFolders',
    'loadLabels',
    'loadThreads'
]);

module.exports = Actions;