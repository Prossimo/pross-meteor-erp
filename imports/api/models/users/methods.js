import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ROLES } from './users'

export const createAdminUser = () => {
    if(Meteor.isServer) {
        const admin = Meteor.users.findOne({username:'root'})

        if(!admin){
            const superAdminId = Accounts.createUser({
                username: 'root',
                email: 'root@admin.com',
                password: 'asdfasdf',
                profile: {
                    firstName: 'Root',
                    lastName: 'Admin',
                    role: [
                        {role: 'admin'}
                    ]
                }
            })

            Roles.addUsersToRoles(superAdminId, [ROLES.ADMIN])

            return superAdminId
        }
        return admin._id
    }
}