import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'

class LabelStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadLabels, this.loadData)

        this.data = [];

        this.loading = false;
    }

    loadData() {
        this.loading = true;
        this.trigger();

        NylasAPI.makeRequest({
            path: '/labels',
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get labels result", result);

            this.data = result;

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

module.exports = new LabelStore()
