import _ from 'underscore';
import NylasAPI from '../../nylas/nylas-api';
import config from '../../config/config';
import NylasAccounts from './nylas-accounts';
import {ADMIN_ROLE_LIST} from '../../constants/roles';


Meteor.methods({
    addNylasAccount(data)
    {
        check(data, {
            name: String,
            email: String,
            password: String,
            provider: String,
            isTeamAccount: Boolean,
            googleRefreshToken: Match.Maybe(String)
        });

        const {name, email, password, provider, isTeamAccount, googleRefreshToken} = data;

        const currentUserId = Meteor.userId()
        if (!currentUserId)
            throw new Meteor.Error('You must login to app')

        const nylasAccounts = Meteor.user().nylasAccounts();
        if (_.find(nylasAccounts, {emailAddress: email}))
            throw new Meteor.Error('You have already registered with this data')


        // Nylas Authentication
        const authData = {
            "client_id": NylasAPI.AppID,
            "name": name,
            "email_address": email,
            "provider": provider
        };

        if (provider == 'gmail') {
            authData.settings = {
                google_client_id: config.google.clientId,
                google_client_secret: config.google.clientSecret,
                google_refresh_token: googleRefreshToken
            }
        } else {
            authData.settings = {
                username: email,
                password: password
            }
        }

        // Call Nylas authorization API
        return NylasAPI.makeRequest({
            path: '/connect/authorize',
            method: 'POST',
            body: authData,
            returnsModel: false,
            timeout: 60000,
            auth: {
                user: '',
                pass: '',
                sendImmediately: true
            }
        }).then((result) => {

            // Call API for getting token
            return NylasAPI.makeRequest({
                path: '/connect/token',
                method: 'POST',
                timeout: 60000,
                body: {
                    client_id: NylasAPI.AppID,
                    client_secret: NylasAPI.AppSecret,
                    code: result.code
                },
                auth: {
                    user: '',
                    pass: '',
                    sendImmediately: true
                },
                error: (error) => {
                    console.error("NylasAPI makeRequest('/connect/token') error", error)
                }
            }).then((account) => {

                // Folders or labels list

                return NylasAPI.makeRequest({
                    path: `/${account.organization_unit}s`,
                    method: 'GET',
                    auth: {
                        user: account.access_token,
                        pass: '',
                        sendImmediately: true
                    }
                }).then((categories) => {

                    const inbox = _.findWhere(categories, {name: 'inbox'})
                    const drafts = _.findWhere(categories, {name: 'drafts'})
                    const sent = _.findWhere(categories, {name: 'sent'})
                    const trash = _.findWhere(categories, {name: 'trash'})
                    const archive = _.findWhere(categories, {name: account.organization_unit == 'label' ? 'all' : 'archive'})


                    const Fiber = require('fibers')

                    Fiber(() => {
                        NylasAccounts.insert({
                            accessToken: account.access_token,
                            accountId: account.account_id,
                            emailAddress: account.email_address,
                            provider: account.provider,
                            organizationUnit: account.organization_unit,
                            name: account.name,
                            isTeamAccount: isTeamAccount,
                            userId: !isTeamAccount ? currentUserId : null,
                            categories: [inbox, drafts, sent, trash, archive]
                        })
                    }).run()

                    return true
                })

            })
        }).catch((error) => {
            console.error("NylasAPI makeRequest('/connect/authorize') error", error);
            throw error
        })
    },

    removeNylasAccount(account)
    {
        if (!account.userId && !Roles.userIsInRole(Meteor.userId(), [...ADMIN_ROLE_LIST]))
            throw new Meteor.Error('You can not remove team account without admin role')
        if (account.userId && Meteor.userId() != account.userId)
            throw new Meteor.Error('You can not remove account of other')

        NylasAccounts.remove({_id: account._id})
    },

    updateNylasAccount(id, data) {
        const account = NylasAccounts.findOne({_id:id})

        if(!account)
            throw new Meteor.Error('Could not find nylas account')

        NylasAccounts.update({_id:id}, {$set:data})
    },

    nylasAccountForAccountId(accountId) {
        const accounts = Meteor.user().nylasAccounts()

        if(!accounts || accounts.length == 0) return null

        return _.find(accounts, {accountId:accountId})
    }
});