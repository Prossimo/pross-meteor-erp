import _ from 'underscore'
import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import CategoryStore from './category-store'
import SalesRecord from '../models/salesRecords/salesRecords'

const PAGE_SIZE = 100

class ThreadStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadThreads, this.onLoadThreads)
        this.listenTo(Actions.changedThreads, this.trigger)
        this.listenTo(Actions.fetchSalesRecordThreads, this.onFetchSalesRecordThreads)

        this.threads = [];
        this.currentThread = null;

        this.loading = false;
        this.fullyLoaded = false;
        this.currentPage = 1;
    }

    onLoadThreads = (category, {page = 1, search}={}) => {
        category = category ? category : CategoryStore.currentCategory
        if(!category) return

        this.loading = true;
        this.trigger();
        const query = QueryString.stringify({in: category.id, offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE});
        NylasAPI.makeRequest({
            path: `/threads?${query}`,
            method: 'GET',
            accountId: category.account_id
        }).then((threads) => {
            //console.log('loadThreads result', threads)

            if (threads && threads.length) {

                threads.forEach((t) => {
                    const thread = _.findWhere(this.threads, {id: t.id})

                    if (!thread) {
                        this.threads.push(t)
                    } else if (thread.version != t.version) {
                        this.threads[_.indexOf(this.threads, thread)] = t
                    }
                })
            }

            if (!threads || threads.length < PAGE_SIZE) {
                this.fullyLoaded = true
            } else {
                this.fullyLoaded = false
            }
        }).finally(() => {
            this.loading = false;
            this.trigger();

            this.currentPage = page ? page : 1;
        })
    }

    onFetchSalesRecordThreads() {
        // For auto attach conversation

        SalesRecord.find().fetch().forEach((sr) => {
            const salesRecordId = sr._id

            sr.threads().forEach((thread) => {

                NylasAPI.makeRequest({
                    path: `/threads/${thread.id}`,
                    method: 'GET',
                    accountId: thread.account_id
                }).then((t) => {
                    if (t.version != thread.version) {
                        Meteor.call('updateThreadAndMessages', sr._id, t, (err,res)=>{

                            setTimeout(()=>{
                                Actions.changedConversations(sr._id)
                            }, 18000)
                        })
                    }
                })
            })
        })
    }

    getThreads(category) {
        const categoryId = category.id
        return (
            this.threads.filter((thread) => {
                if (thread.folders) {
                    return _.findWhere(thread.folders, {id: categoryId}) != null
                } else if (thread.labels) {
                    return _.findWhere(thread.labels, {id: categoryId}) != null
                } else {
                    return false
                }
            }).sort((t1, t2)=>t2.last_message_timestamp-t1.last_message_timestamp)
        )

    }

    isLoading() {
        return this.loading;
    }

    selectThread(thread) {
        Actions.loadMessages(thread);
        this.currentThread = thread;
    }

    changeThreads(threads) {
        threads.forEach((t) => {
            const thread = _.findWhere(this.threads, {id: t.id})
            if (thread) {
                const index = _.indexOf(this.threads, thread)
                this.threads[index] = t
            }
        })
        this.trigger()
    }
}

module.exports = new ThreadStore()
