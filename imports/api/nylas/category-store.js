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

        this.categories = [];
        this.selectedCategory = null;

        this.loading = false;
    }

    onLoadCategories = (accountId) => {
        let accounts = []
        if(accountId)
            accounts.push(AccountStore.accountForAccountId(accountId))
        else
            accounts = AccountStore.accounts()


        if(accounts.length == 0) return;

        accounts.forEach((account)=>{
            accountId = account.accountId
            this.loading = true;
            this.trigger();

            NylasAPI.makeRequest({
                path: `/${account.organizationUnit}s`,
                method: 'GET',
                accountId: account.accountId
            }).then((result) => {
                console.log("Nylas get categories result", result);

                if(result && result.length) {
                    result.forEach((item)=>{
                        if(!_.find(this.categories, {id:item.id})) {
                            this.categories.push(item)
                        }
                    })

                    //if(!this.selectedCategory) {
                    /*const inbox = _.findWhere(result, {name:'inbox'});

                    if(inbox) {
                        this.selectCategory(inbox);
                    }*/
                    //}
                }
                this.loading = false;
                this.trigger();
            })
        })
    }

    getCategories(accountId) {
        if(accountId) {
            return _.find(this.categories, {accound_id:accountId})
        }
        return this.categories;
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
        const category = _.findWhere(this.categories, {name:'inbox', account_id:accountId})

        return category
    }

    getArchiveCategory(accountId) {
        const account = AccountStore.accountForAccountId(accountId)

        const category = _.findWhere(this.categories, {name:NylasUtils.usesFolders(account) ? 'archive' : 'all', account_id:accountId})

        return category
    }

    getTrashCategory(accountId) {
        const category = _.findWhere(this.categories, {name:'trash', account_id:accountId})
        return category
    }

    getSpamCategory(accountId) {
        const category = _.findWhere(this.categories, {name:'spam', account_id:accountId})
        return category
    }


    getAllMailCategory(accountId) {
        if(!accountId) return null
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return null
        if(!NylasUtils.usesLabels(account)) return null

        const category = _.findWhere(this.categories, {name: 'all', account_id:accountId})
        return category
    }
}

module.exports = new CategoryStore()
