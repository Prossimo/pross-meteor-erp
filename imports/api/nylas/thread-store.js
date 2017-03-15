import _ from 'underscore'
import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import AccountStore from './account-store'

const PAGE_SIZE = 100

class ThreadStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadThreads, this.onLoadThreads)

        this.threads = [];
        this.selectedThread = null;

        this.loading = false;
        this.fullyLoaded = false;
        this.currentPage = 1;
    }

    onLoadThreads = (category, {page=1, search}={}) => {
        this.loading = true;
        this.trigger();


        const query = QueryString.stringify({in:category.id, offset:(page-1)*PAGE_SIZE, limit:PAGE_SIZE});
        NylasAPI.makeRequest({
            path: `/threads?${query}`,
            method: 'GET',
            accountId: category.account_id
        }).then((result) => {
            console.log("Nylas get threads result", result);

            if(result && result.length) {
                result.forEach((item)=>{
                    const thread = _.findWhere(this.threads, {id:item.id})

                    if(!thread) {
                        this.threads.push(item)
                    } else if(thread.version != item.version) {
                        this.threads[_.indexOf(this.threads, thread)] = item
                    }
                })
            }

            if(!result || result.length<PAGE_SIZE) {
                this.fullyLoaded = true
            } else {
                this.fullyLoaded = false
            }
        }).finally(()=>{
            this.loading = false;
            this.trigger();

            this.currentPage = page ? page : 1;
        })
    }

    getThreads(category) {
        const categoryId = category.id
        return this.threads.filter((thread)=>{
            if(thread.folders) {
                return _.findWhere(thread.folders, {id:categoryId}) != null
            } else if(thread.labels) {
                return _.findWhere(thread.labels, {id:categoryId}) != null
            } else {
                return false
            }
        })
    }

    isLoading() {
        return this.loading;
    }

    selectThread(thread) {
        Actions.loadMessages(thread);
        this.selectedThread = thread;
    }

    getSelectedThread() {
        return this.selectedThread;
    }

    changeThreads(threads) {
        threads.forEach((t)=>{
            const thread = _.findWhere(this.threads, {id: t.id})
            if(thread) {
                const index = _.indexOf(this.threads, thread)
                this.threads[index] = t
            }
        })
        this.trigger()
    }
}

module.exports = new ThreadStore()
