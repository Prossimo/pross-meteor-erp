import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import NylasUtils from './nylas-utils'
import AccountStore from './account-store'

class CategoryStoreClass extends Reflux.Store {
    constructor() {
        super()

        this.currentCategory = null
    }

    getCategories(accountId) {
        const account = AccountStore.accountForAccountId(accountId)

        const categories = account ?
            account.categories.concat([{
                id: `unread-${accountId}`,
                name: 'unread',
                display_name:'Unread',
                account_id: accountId
            }, {
                id: `open-${accountId}`,
                name: 'open',
                display_name:'Open',
                account_id: accountId
            }]) : []

        return this.sort(categories)
    }

    sort(categories) {
        return categories.sort((c1, c2) => {
            const i1 = NylasUtils.categoryOrder(c1.name)
            const i2 = NylasUtils.categoryOrder(c2.name)

            return i1 - i2
        })
    }

    selectCategory(category) {
        this.currentCategory = category
        this.trigger()

       if(category.name === 'drafts') {
            Actions.loadDrafts(category)
       } else {
          Actions.loadThreads(category)
       }
    }

    getInboxCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'inbox'})
    }

    getArchiveCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:NylasUtils.usesFolders(accountId) ? 'archive' : 'important'})
    }

    getTrashCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'trash'})
    }

    getSpamCategory(accountId) {
        return _.findWhere(this.getCategories(accountId), {name:'spam'})
    }


    getAllMailCategory(accountId) {
        if(!accountId) return null
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return null
        if(!NylasUtils.usesLabels(account)) return null

        const category = _.findWhere(account.categories, {name: 'all'})
        return category
    }
}

const CategoryStore = new CategoryStoreClass()
export default CategoryStore;
