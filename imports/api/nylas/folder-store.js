import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'


class FolderStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadFolders, this.loadData)

        this.data = [];

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
                    Actions.loadThreads({in:inbox.id});
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
}

module.exports = new FolderStore()
