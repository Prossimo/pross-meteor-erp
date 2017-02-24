import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'


class FolderStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadFolders, this.loadData)

        this.data = [];
        this.selectedFolder = null;

        this.loading = false;
    }

    loadData() {
        this.loading = true;
        this.trigger();

        const provider = Meteor.user().nylas.provider;
        NylasAPI.makeRequest({
            path: provider=='gmail' ? '/labels' : '/folders',
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get folders result", result);

            this.data = result;

            if(result) {
                const inbox = _.findWhere(result, {name:'inbox'});

                if(inbox) {
                    this.selectFolder(inbox);
                }
            }
            this.loading = false;
            this.trigger();
        })
    }

    getData() {
        return this.data;
    }

    isLoading() {
        return this.loading;
    }

    selectFolder(folder) {
        Actions.loadThreads({in:folder.id});
        this.selectedFolder = folder;
    }

    getSelectedFolder() {
        return this.selectedFolder;
    }
}

module.exports = new FolderStore()
