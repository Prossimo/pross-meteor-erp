import _ from 'underscore'
import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import AccountStore from './account-store'

class ThreadStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadThreads, this.onLoadThreads)

        this.threads = [];
        this.selectedThread = null;

        this.loading = false;
    }

    onLoadThreads = (folder, {page, search}={}) => {
        this.loading = true;
        this.trigger();

        const query = QueryString.stringify({in:folder.id});
        NylasAPI.makeRequest({
            path: `/threads?${query}`,
            method: 'GET',
            accountId: folder.account_id
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

            this.loading = false;
            this.trigger();
        })
    }

    getThreads(folderId) {console.log('getThreads', folderId, this.threads)
        return this.threads.filter((thread)=>{
            if(thread.folders) {
                return _.findWhere(thread.folders, {id:folderId}) != null
            } else if(thread.labels) {
                return _.findWhere(thread.labels, {id:folderId}) != null
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
}

module.exports = new ThreadStore()
