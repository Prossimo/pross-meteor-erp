import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'

class FolderStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadFolders, this.loadData)

        this.data = [];

    }

    loadData() {

        NylasAPI.makeRequest({
            path: '/labels',
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get folders result", result);

            this.data = result;

            this.trigger();
        })
    }

    getData() {
        return this.data;
    }
}

module.exports = new FolderStore()
