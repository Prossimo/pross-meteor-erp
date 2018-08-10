import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import _ from 'underscore'

import { Roles } from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { ROLES, STATUS } from './users'

const dealsStateNew = new ValidatedMethod({
    name: 'users.dealsState.new',
    validate: new SimpleSchema({
        name: {
            type: String
        },
        params: {
            type: Object,
            blackbox: true
        }
    }).validator(),
    run({
        name,
        params
    }) {
        const id = Random.id()
        const user = Meteor.users.findOne(this.userId)
        const states = (user && user.dealsStates) ? user.dealsStates : []
        const newState = {
            id,
            name,
            params
        }
        states.push(newState)
        Meteor.users.update(user._id, {
            $set: {
                dealsStates: states
            }
        })
        return {
            states,
            newState
        }
    }
})

const dealsStateList = new ValidatedMethod({
    name: 'users.dealsState.list',
    validate() {},
    run() {
        const user = Meteor.users.findOne(this.userId)
        return (user && user.dealsStates) ? user.dealsStates : []
    }
})

const dealsStateRemove = new ValidatedMethod({
    name: 'users.dealsState.remove',
    validate(id) {
        check(id, String)
    },
    run(id) {
        const user = Meteor.users.findOne(this.userId)
        if (user && user.dealsStates) {
            const states = user.dealsStates.length ? user.dealsStates : []
            const dropId = _.findIndex(states, {
                id
            })
            Meteor.users.update(user._id, {
                $set: {
                    dealsStates: [].concat(
                        states.slice(0, dropId),
                        states.slice(1 + dropId)
                    )
                }
            })
            return {
                id
            }
        }
    }
})

export const createAdminUser = () => {
    if (Meteor.isServer) {
        const admin = Meteor.users.findOne({
            username: 'root'
        })

        if (!admin) {
            const superAdminId = Accounts.createUser({
                username: 'root',
                email: 'root@admin.com',
                password: 'asdfasdf',
                profile: {
                    firstName: 'Root',
                    lastName: 'Admin',
                    role: [{
                        role: 'admin'
                    }]
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

        if (!user) throw new Meteor.Error(`Not found user with _id:${_id}`)

        let bFound = true
        if (!user.slack) {
            bFound = false
            let cursor
            while (1) {
                const data = Meteor.call('getSlackUsers', cursor)

                if (!data.ok) break
                if (!data.members) break

                data.members.forEach((member) => {
                    if (member.profile.email === user.email()) {
                        bFound = true
                        Meteor.users.update({
                            _id
                        }, {
                            $set: {
                                slack: member
                            }
                        })
                    }
                })
                if (bFound) break
                if (!data.cursor) break

                cursor = data.cursor
            }
        }
        if (!bFound) throw new Meteor.Error('Not found slack info')

        Meteor.users.update({
            _id
        }, {
            $set: {
                status: STATUS.ACTIVE
            }
        })

    },
})