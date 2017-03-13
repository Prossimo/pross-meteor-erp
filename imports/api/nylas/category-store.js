import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import NylasUtils from './nylas-utils'
import AccountStore from './account-store'

class CategoryStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadCategories, this.onLoadCategories)

        this.categories = {};
        this.selectedCategory = null;

        this.loading = false;
    }

    onLoadCategories = (accountId) => {
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return;

        accountId = account.account_id
        this.loading = true;
        this.trigger();

        if(!this.categories[accountId]) this.categories[accountId] = []

        NylasAPI.makeRequest({
            path: `/${account.organization_unit}s`,
            method: 'GET',
            accountId: account.account_id
        }).then((result) => {
            console.log("Nylas get categories result", result);

            if(result && result.length) {
                console.log("FolderStore",this.categories[accountId], accountId, this.categories)
                result.forEach((item)=>{
                    if(!_.contains(this.categories[accountId], item)) {
                        this.categories[accountId].push(item)
                    }
                })

                //if(!this.selectedCategory) {
                    const inbox = _.findWhere(result, {name:'inbox'});

                    if(inbox) {
                        this.selectCategory(inbox);
                    }
                //}
            }
            this.loading = false;
            this.trigger();
        })
    }

    getCategories(accountId) {
        if(!accountId) {
            const defaultAccount = AccountStore.defaultAccount()

            if(defaultAccount) accountId = defaultAccount.account_id
        }
        return this.categories[accountId];
    }

    isLoading() {
        return this.loading;
    }

    selectCategory(category) {
        Actions.loadThreads(category);
        this.selectedCategory = category;
    }

    getSelectedCategory() {
        return this.selectedCategory;
    }

    getInboxCategory(accountId) {
        const categories = this.getCategories(accountId)

        const category = _.findWhere(categories, {name:'inbox'})
        console.log(accountId, category)
        return category
    }

    getArchiveCategory(accountId) {
        const account = AccountStore.accountForAccountId(accountId)

        const categories = this.getCategories(accountId)

        const category = _.findWhere(categories, {name:NylasUtils.usesFolders(account) ? 'archive' : 'all'})
        console.log(accountId, category)
        return category
    }

    getTrashCategory(accountId) {
        const categories = this.getCategories(accountId)

        const category = _.findWhere(categories, {name: 'trash'})
        console.log(accountId, category)
        return category
    }

    getSpamCategory(accountId) {
        const categories = this.getCategories(accountId)

        const category = _.findWhere(categories, {name: 'spam'})
        console.log(accountId, category)
        return category
    }


    getAllMailCategory(accountId) {
        if(!accountId) return null
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return null
        if(!NylasUtils.usesLabels(account)) return null

        const categories = this.getCategories(accountId)

        const category = _.findWhere(categories, {name: 'all'})
        console.log(accountId, category)
        return category
    }
}

module.exports = new CategoryStore()
