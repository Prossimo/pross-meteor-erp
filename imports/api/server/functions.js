import { SUPER_ADMIN_ROLE } from '../constants/roles';

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
