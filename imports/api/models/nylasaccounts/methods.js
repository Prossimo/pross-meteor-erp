import _ from "underscore";
import { Roles } from "meteor/alanning:roles";
import NylasAPI from "../../nylas/nylas-api";
import config from "../../config";
import NylasAccounts from "./nylas-accounts";
import { ROLES } from "../users/users";
import { createProject } from "../projects/methods";
import { ErrorLog, ServerLog } from "/imports/utils/logger";

const bound = Meteor.bindEnvironment(callback => callback());

const authError = error => {
  console.log("error", error);
  ErrorLog.error("NylasAPI makeRequest('/connect/authorize') error", error);
  throw new Meteor.Error(error.name, error.message);
};

Meteor.methods({
  addNylasAccount(data) {
    check(data, {
      name: String,
      email: String,
      password: String,
      provider: String,
      isTeamAccount: Boolean,
      googleRefreshToken: Match.Maybe(String),
      isPrivateSlackChannel: Match.Maybe(Boolean)
    });

    const {
      name,
      email,
      password,
      provider,
      isTeamAccount,
      googleRefreshToken,
      isPrivateSlackChannel
    } = data;

    const currentUserId = Meteor.userId();
    if (!currentUserId) throw new Meteor.Error("You must login to app");

    const nylasAccounts = Meteor.user().nylasAccounts();
    // console.log('nylasAccounts', nylasAccounts);
    if (_.find(nylasAccounts, { emailAddress: email }))
      throw new Meteor.Error("You have already registered with this data");

    // Nylas Authentication
    const authData = {
      client_id: NylasAPI.AppID,
      name,
      email_address: email,
      provider
    };

    if (provider == "gmail") {
      authData.settings = {
        google_client_id: config.google.clientId,
        google_client_secret: config.google.clientSecret,
        google_refresh_token: googleRefreshToken
      };
    } else {
      authData.settings = {
        username: email,
        password
      };
    }

    // Call Nylas authorization API

    return NylasAPI.makeRequest({
      path: "/connect/authorize",
      method: "POST",
      body: authData,
      returnsModel: false,
      timeout: 60000,
      auth: {
        user: "",
        pass: "",
        sendImmediately: true
      }
    })
      .then(result => {
        // Call API for getting token
        return NylasAPI.makeRequest({
          path: "/connect/token",
          method: "POST",
          timeout: 60000,
          body: {
            client_id: NylasAPI.AppID,
            client_secret: NylasAPI.AppSecret,
            code: result.code
          },
          auth: {
            user: "",
            pass: "",
            sendImmediately: true
          },
          error: error => {
            ErrorLog.error(
              "NylasAPI makeRequest('/connect/token') error",
              error
            );
          }
        }).then(account => {
          // Folders or labels list

          const getCategories = NylasAPI.makeRequest({
            path: `/${account.organization_unit}s`,
            method: "GET",
            auth: {
              user: account.access_token,
              pass: "",
              sendImmediately: true
            }
          }).then(categories => {
            if (categories.length === 0) {
              // return getCategories()
            } else {
              bound(() => {
                const nylasAccountId = NylasAccounts.insert({
                  accessToken: account.access_token,
                  accountId: account.account_id,
                  emailAddress: account.email_address,
                  provider: account.provider,
                  organizationUnit: account.organization_unit,
                  name: account.name,
                  isTeamAccount,
                  userId: !isTeamAccount ? currentUserId : null,
                  categories
                });

                if (isTeamAccount) {
                  try {
                    createProject.call({
                      name: account.name,
                      nylasAccountId,
                      isServer: true,
                      members: [],
                      isPrivateSlackChannel
                    });
                  } catch (err) {
                    ErrorLog.error(err);
                  }
                }
              });

              return true;
            }
          });
          return true;
        });
      })
      .catch(authError);
    /*
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
        })
            .then(
            )
            .catch((error) => {
                ErrorLog.error('NylasAPI makeRequest(\'/connect/authorize\') error', error)
                throw error
            })

        */
  },

  removeNylasAccount(account) {
    check(account, Object);
    if (!account.userId && !Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN))
      throw new Meteor.Error(
        "You can not remove team account without admin role"
      );
    if (account.userId && Meteor.userId() != account.userId)
      throw new Meteor.Error("You can not remove account of other");

    NylasAccounts.remove({ _id: account._id });
  },

  updateNylasAccount(_id, data) {
    check(_id, String);
    check(data, Object);
    const account = NylasAccounts.findOne({ _id });

    if (!account) throw new Meteor.Error("Could not find nylas account");

    NylasAccounts.update({ _id }, { $set: data });
  },

  nylasAccountForAccountId(accountId) {
    check(accountId, String);
    const accounts = Meteor.user().nylasAccounts();

    if (!accounts || accounts.length == 0) return null;

    return _.find(accounts, { accountId });
  },

  fetchUnreads(_id) {
    check(_id, String);

    const account = NylasAccounts.findOne({ _id });
    if (!account) throw new Meteor.Error(`Not found account with _id:${_id}`);

    account.categories.forEach((category, index) => {
      if (category && category.id) {
        setTimeout(() => {
          NylasAPI.makeRequest({
            path: `/threads?in=${category.id}&unread=true&view=count`,
            method: "GET",
            auth: {
              user: account.accessToken,
              pass: "",
              sendImmediately: true
            }
          })
            .then(result => {
              bound(() => {
                NylasAccounts.update(
                  {
                    _id,
                    "categories.id": category.id
                  },
                  { $set: { "categories.$.unreads": result.count } }
                );
              });
            })
            .catch(err => {
              ErrorLog.error(err);
            });
        }, 1000 * 10 * index);
      }
    });
  },

  updateNylasAccountTeamMembers(_id, teamMembers) {
    check(_id, String);
    check(teamMembers, Array);

    const account = NylasAccounts.findOne({ _id });
    if (!account) throw new Meteor.Error(`Not found account with _id:${_id}`);

    ServerLog.info("updateNylasAccountTeamMembers", { $set: { teamMembers } });
    NylasAccounts.update({ _id }, { $set: { teamMembers } });
  }
});
