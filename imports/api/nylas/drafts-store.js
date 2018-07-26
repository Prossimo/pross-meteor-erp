import Reflux from 'reflux'
import QueryString from 'query-string'
import find from 'lodash/find'
import indexOf from 'lodash/indexOf'
import Actions from './actions'
import NylasAPI from './nylas-api'
import CategoryStore from './category-store'

const PAGE_SIZE = 100

class DraftsStoreClass extends Reflux.Store {
    constructor() {
        super()
        this.listenTo(Actions.loadDrafts, this.onLoadDrafts)
        this.listenTo(Actions.fetchNewDrafts, this.fetchNewDrafts)
        this.listenTo(Actions.changedDrafts, this.trigger)
        this.listenTo(Actions.searchDrafts, this.onSearchDrafts)

        this.drafts = []
        this._currentDraft = {}

        this.loading = false
        this.fullyLoaded = false
        this.currentPage = 1
    }

    onSearchDrafts = (keyword) => {
        this.keyword = keyword&&keyword.length ? keyword : null
        this.onLoadDrafts()
        this.trigger()
    }

    onLoadDrafts = (category, {page = 1, search}={}) => {
        category = category ? category : CategoryStore.currentCategory
        if(!category || category.name!=='drafts') return

        const query = {offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE}

        if(page == 1) this.fullyLoaded = false

        this.currentPage = page

        let path
        if(this.keyword) {
            path = `/drafts/search?${QueryString.stringify(Object.assign(query, {q:this.keyword}))}`
        } else {
            path = `/drafts?${QueryString.stringify(query)}`
        }//console.log('Nylas Path', path)

        this.loading = true
        this.trigger()

        NylasAPI.makeRequest({
            path,
            method: 'GET',
            accountId: category.account_id
        }).then(results => {
            if(results.length < PAGE_SIZE) this.fullyLoaded = true
        }).finally(() => {
            this.loading = false
            this.trigger()
        })
    }

    onFetchNewDrafts = () => {

        const loadDrafts = (folder) => {
            if(!folder || !folder.account_id) return Promise.resolve([])

            const query = {offset:0, limit:PAGE_SIZE}

            return new Promise((resolve, reject) => NylasAPI.makeRequest({
                    path: `/drafts?${QueryString.stringify(Object.assign(query, {in:folder.id}))}`,
                    method: 'GET',
                    accountId: folder.account_id
                }).then(threads => resolve(threads)).catch(err => reject(err)))
        }

        const promises = Meteor.user().nylasAccounts().map(account => loadDrafts(find(account.categories, {name:'drafts'})))

        this.fetching = true
        this.trigger()

        Promise.all(promises).then((drafts) => {
            //console.log('Load Threads result', threads)
        }).finally(() => {
            this.fetching = false
            this.trigger()
        })
    }

    getDrafts() {
        return this.drafts
    }

    isLoading() {
        return this.loading
    }

    selectDraft(draft) {
        this._currentDraft[CategoryStore.currentCategory.id] = draft
        this.trigger()
    }

    currentDraft(category=null) {
        if(!category) category = CategoryStore.currentCategory
        if(!category || category.name!=='drafts') return null

        return this._currentDraft[category.id]
    }
    changeDrafts(drafts) {
       drafts.forEach((t) => {
            const draft = find(this.drafts, {id: t.id})
            if (draft) {
                const index = indexOf(this.drafts, draft)
                this.drafts[index] = t
            }
        })
        this.trigger()
    }
}

const DraftsStore = new DraftsStoreClass()
export default DraftsStore
