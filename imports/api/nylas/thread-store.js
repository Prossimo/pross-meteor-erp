import Reflux from 'reflux'
import queryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'

class ThreadStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadThreads, this.loadData)

        this.data = [];

        this.loading = false;
    }

    loadData(filters) {
        this.loading = true;
        this.trigger();

        const query = queryString.stringify(filters);
        NylasAPI.makeRequest({
            path: `/threads?${query}`,
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get threads result", result);

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

module.exports = new ThreadStore()
