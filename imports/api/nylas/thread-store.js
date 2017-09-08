import _ from 'underscore'
import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import CategoryStore from './category-store'

const PAGE_SIZE = 100

class ThreadStore extends Reflux.Store {
    constructor() {
        super()
        this.listenTo(Actions.loadThreads, this.onLoadThreads)
        this.listenTo(Actions.changedThreads, this.trigger)
        this.listenTo(Actions.searchThreads, this.onSearchThreads)

        this.threads = []
        this._currentThread = {}

        this.loading = false
        this.fullyLoaded = false
        this.currentPage = 1
    }

    onSearchThreads = (keyword) => {
        this.keyword = keyword&&keyword.length ? keyword : null
        this.onLoadThreads()
        this.trigger()
    }
    onLoadThreads = (category, {page = 1, search}={}) => {
        category = category ? category : CategoryStore.currentCategory
        if(!category) return

        this.loading = true
        Actions.loadMessages(this._currentThread[category.id])

        this.trigger()

        const query = {offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE}
        let path
        if(this.keyword) {
            path = `/threads/search?${QueryString.stringify(Object.assign(query, {q:this.keyword}))}`
        } else {
            path = `/threads?${QueryString.stringify(Object.assign(query, {in:category.id}))}`
        }//console.log('Nylas Path', path)

        NylasAPI.makeRequest({
            path,
            method: 'GET',
            accountId: category.account_id
        }).then((threads) => {
            //console.log('loadThreads result', threads)
            if (!threads || threads.length < PAGE_SIZE) {
                this.fullyLoaded = true
            } else {
                this.fullyLoaded = false
            }
        }).finally(() => {
            this.loading = false
            this.trigger()

            this.currentPage = page ? page : 1
        })
    }

    getThreads() {
        return this.threads
    }

    isLoading() {
        return this.loading
    }

    selectThread(thread) {
        this._currentThread[CategoryStore.currentCategory.id] = thread
        this.trigger()

        if(this.loadMessageTimeout) { clearTimeout(this.loadMessageTimeout) }

        this.loadMessageTimeout = setTimeout(() => {
            Actions.loadMessages(thread)
        }, 500)
    }

    currentThread(category=null) {
        if(!category) category = CategoryStore.currentCategory
        if(!category) return null

        return this._currentThread[category.id]
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
