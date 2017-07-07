import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ROLES, STATUS } from './users'

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

Meteor.methods({
    activeUser(_id) {
        check(_id, String)

        const user = Meteor.users.findOne(_id)

        if(!user) throw Meteor.Error(`Not found user with _id:${_id}`)
        if(!user.slack) {
            //Meteor.call('inviteUserToSlack', user.email())
            throw Meteor.Error('Not found slack info')
        }

        Meteor.users.update({_id}, {$set:{status:STATUS.ACTIVE}})

    },
})
