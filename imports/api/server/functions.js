import { SUPER_ADMIN_ROLE } from '../constants/roles';
import config from '../config/config';

export const createAdminUser = ()=>{
    if(!Meteor.users.findOne()){
        const superAdminId = Accounts.createUser({
            username: "root",
            email: "root@admin.com",
            password: "asdfasdf",
            profile: {
                firstName: "Root",
                lastName: "Admin",
                role: [
                    {role: 'admin'}
                ]
            }
        });

        Roles.addUsersToRoles( superAdminId, [ SUPER_ADMIN_ROLE ] );
    }
};

/**
 * Get google auth token
 * @param scope - Array of google scopes
 * @param callback
 */
export const googleServerApiAutToken = (scope, callback) => {
    const TokenCache = require('google-oauth-jwt').TokenCache,
        tokens = new TokenCache();
    
    tokens.get({
        // use the email address of the service account, as seen in the API console
        email: config.google.serviceAccountEmail,
        // use the PEM file we generated from the downloaded key
        keyFile: config.google.serviceAccountPemCertPath,
        // specify the scopes you wish to access
        scopes: scope
    }, (err, token) => {
        callback(null, token);
    });
};
