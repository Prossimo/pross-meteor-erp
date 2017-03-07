import _ from 'underscore'
import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import AccountStore from './account-store'

class FolderStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.loadFolders, this.onLoadFolders)

        this.folders = {};
        this.selectedFolder = null;

        this.loading = false;
    }

    onLoadFolders = (accountId) => {
        const account = AccountStore.accountForAccountId(accountId)

        if(!account) return;

        accountId = account.account_id
        this.loading = true;
        this.trigger();

        if(!this.folders[accountId]) this.folders[accountId] = []

        NylasAPI.makeRequest({
            path: `/${account.organization_unit}s`,
            method: 'GET',
            accountId: account.account_id
        }).then((result) => {
            console.log("Nylas get folders result", result);

            if(result && result.length) {
                console.log("FolderStore",this.folders[accountId], accountId, this.folders)
                result.forEach((item)=>{
                    if(!_.contains(this.folders[accountId], item)) {
                        this.folders[accountId].push(item)
                    }
                })

                if(!this.selectedFolder) {
                    const inbox = _.findWhere(result, {name:'inbox'});

                    if(inbox) {
                        this.selectFolder(inbox);
                    }
                }
            }
            this.loading = false;
            this.trigger();
        })
    }

    getFolders(accountId) {
        if(!accountId) {
            const defaultAccount = AccountStore.defaultAccount()

            if(defaultAccount) accountId = defaultAccount.account_id
        }
        return this.folders[accountId];
    }

    isLoading() {
        return this.loading;
    }

    selectFolder(folder) {
        Actions.loadThreads(folder);
        this.selectedFolder = folder;
    }

    getSelectedFolder() {
        return this.selectedFolder;
    }
}

module.exports = new FolderStore()
