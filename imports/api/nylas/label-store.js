import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'

class LabelStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadLabels, this.loadData)

        this.data = [];

    }

    loadData() {console.log("loadLabelData started=====");

        NylasAPI.makeRequest({
            path: '/labels',
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get labels result", result);

            this.data = result;

            this.trigger();
        })
    }

    getData() {
        return this.data;
    }
}

module.exports = new LabelStore()
