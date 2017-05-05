import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { SUPER_ADMIN_ROLE } from '../../constants/roles';

export const createAdminUser = () => {
    if(Meteor.isServer) {
        let admin = Meteor.users.findOne({username:'root', email:'root@admin.com'})
        if(!admin){
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

            Roles.addUsersToRoles(superAdminId, [SUPER_ADMIN_ROLE], Roles.GLOBAL_GROUP);

            return superAdminId
        }
        return admin._id
    }
};