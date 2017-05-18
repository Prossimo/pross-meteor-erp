import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import {Factory} from 'meteor/dburles:factory'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertPerson, updatePerson, removePerson } from './methods'
import People from './people'

if(Meteor.isServer) {
    describe('people', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        let data = {
            name: 'John Smith',
            email: 'john@prossimo.us',
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
            assert.equal(person.email, data.email)
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
                email: 'john1@prossimo.us',
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
            assert.equal(person.email, data.email)
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