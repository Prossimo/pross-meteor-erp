import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import {Factory} from 'meteor/dburles:factory'
import People from './people'
import Designations from './designations'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertPerson, updatePerson, removePerson, insertDesignation, updateDesignation, removeDesignation } from './methods'

if(Meteor.isServer) {
    describe('people.desinations', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        let data = {
            name: 'Team Member',
            role_addable: false,
            roles: ['Admin', 'Manager', 'Sales', 'Takeoffs', 'Arch']
        }

        it('should insert designation correctly by factory and method', () => {
            let designation = Factory.create('designation')
            assert.typeOf(designation, 'object')
            assert.typeOf(designation.created_at, 'date')

            const designationId = insertDesignation._execute({userId:adminId}, data)

            assert.typeOf(designationId, 'string')

            designation = Designations.findOne({_id:designationId})

            assert.equal(designation.name, data.name)
            assert.equal(designation.role_addable, data.role_addable)
            assert.typeOf(designation.roles, 'array')
            assert.equal(designation.roles.length, data.roles.length)
        })

        it('should update designation correctly by method', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            data = {
                _id,
                name: 'Stakeholder',
                role_addable: true,
                roles: ['Developer', 'Architectect', 'GC', 'Contractor', 'Installer', 'Energy Consultant', 'Facade Consultant']
            }
            const results = updateDesignation._execute({userId:adminId}, data)

            assert.equal(results, 1)

            const designation = Designations.findOne(_id)

            assert.equal(designation.name, data.name)
            assert.equal(designation.role_addable, data.role_addable)
            assert.typeOf(designation.roles, 'array')
            assert.equal(designation.roles.length, data.roles.length)
        })

        it('should remove designation correctly by method', () => {
            const _id = insertDesignation._execute({userId:adminId}, data)

            removeDesignation._execute({userId:adminId}, {_id})

            const designation = Designations.findOne({_id})
            assert.equal(designation, null)
        })
    })

    describe('people', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        let data = {
            name: 'John Smith',
            twitter: 'http://www.twitter.com/john',
            facebook: 'http://www.facebook.com/john',
            linkedin: 'http://www.linkedin.com/john',
            designation_id: Factory.create('designation')._id,
            role: 'Manager',
            emails: [{
                email: 'john@prossimo.us.office',
                type: 'office',
                is_default: true
            }],
            phone_numbers: [{
                number: '1-234-5678',
                type: 'office',
                is_default: true
            }],
            company_id: Factory.create('company')._id,
            position: 'Project Manager'
        }

        it('should insert person correctly by factory and method', () => {
            let person = Factory.create('person')
            assert.typeOf(person, 'object')
            assert.typeOf(person.created_at, 'date')

            const personId = insertPerson._execute({userId:adminId}, data)

            assert.typeOf(personId, 'string')

            person = People.findOne({_id:personId})

            assert.equal(person.name, data.name)
            assert.equal(person.twitter, data.twitter)
            assert.equal(person.facebook, data.facebook)
            assert.equal(person.linkedin, data.linkedin)
            assert.equal(person.designation_id, data.designation_id)
            assert.equal(person.role, data.role)
            assert.typeOf(person.phone_numbers, 'array')
            assert.equal(person.phone_numbers.length, 1)
            assert.deepEqual(person.phone_numbers[0], data.phone_numbers[0])
            assert.typeOf(person.emails, 'array')
            assert.equal(person.emails.length, 1)
            assert.deepEqual(person.emails[0], data.emails[0])
            assert.equal(person.company_id, data.company_id)
            assert.equal(person.position, data.position)
        })

        it('should update person correctly by method', () => {
            const _id = insertPerson._execute({userId:adminId}, data)

            data = {
                _id,
                name: 'John Smith1',
                twitter: 'http://www.twitter.com/john1',
                facebook: 'http://www.facebook.com/john1',
                linkedin: 'http://www.linkedin.com/john1',
                designation_id: Factory.create('designation')._id,
                role: 'Manager1',
                emails: [{
                    email: 'john1@prossimo.us.office',
                    type: 'office1',
                    is_default: true
                }],
                phone_numbers: [{
                    number: '1-234-56789',
                    type: 'office1',
                    is_default: true
                }],
                company_id: Factory.create('company')._id,
                position: 'Project Manager1'
            }
            const results = updatePerson._execute({userId:adminId}, data)

            assert.equal(results, 1)

            const person = People.findOne(_id)

            assert.equal(person.name, data.name)
            assert.equal(person.twitter, data.twitter)
            assert.equal(person.facebook, data.facebook)
            assert.equal(person.linkedin, data.linkedin)
            assert.equal(person.designation_id, data.designation_id)
            assert.equal(person.role, data.role)
            assert.typeOf(person.phone_numbers, 'array')
            assert.equal(person.phone_numbers.length, 1)
            assert.deepEqual(person.phone_numbers[0], data.phone_numbers[0])
            assert.typeOf(person.emails, 'array')
            assert.equal(person.emails.length, 1)
            assert.deepEqual(person.emails[0], data.emails[0])
            assert.equal(person.company_id, data.company_id)
            assert.equal(person.position, data.position)
        })

        it('should remove person correctly by method', () => {
            const _id = insertPerson._execute({userId:adminId}, data)

            removePerson._execute({userId:adminId}, {_id})

            const person = People.findOne({_id})
            assert.equal(person, null)
        })
    })
}