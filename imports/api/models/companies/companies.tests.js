import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import faker from 'faker'
import {Factory} from 'meteor/dburles:factory'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertCompany, updateCompany, removeCompany } from './methods'
import Companies from './companies'
import CompanyTypes from '../companytypes/companytypes'

if(Meteor.isServer) {
    describe('companies', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        it('should insert company correctly by factory and method', () => {
            let company = Factory.create('company')
            assert.typeOf(company, 'object')
            assert.typeOf(company.created_at, 'date')

            const type_id = Factory.create('companytype')._id
            console.log(type_id)
            const companyData = {
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_id,
                phone_numbers: [{
                    number: faker.phone.phoneNumber(),
                    type:faker.random.word(),
                    is_default: true
                }],
                addresses: [{
                    address: faker.address.streetAddress(),
                    type: faker.random.word(),
                    is_default: true,
                    is_billing: true,
                    is_mail: true
                }]
            }

            const companyId = insertCompany._execute({userId:adminId}, companyData)

            assert.typeOf(companyId, 'string')

            company = Companies.findOne({_id:companyId})
            assert.equal(company.name, companyData.name)
            assert.equal(company.website, companyData.website)
            assert.equal(company.type_id, companyData.type_id)
            assert.typeOf(company.phone_numbers, 'array')
            assert.equal(company.phone_numbers.length, 1)
            assert.deepEqual(company.phone_numbers[0], companyData.phone_numbers[0])
            assert.typeOf(company.addresses, 'array')
            assert.equal(company.addresses.length, 1)
            assert.deepEqual(company.addresses[0], companyData.addresses[0])
        })

        it('should update company correctly by method', () => {
            let company = Factory.create('company')

            const _id = company._id

            const companyData = {
                _id,
                name: faker.company.companyName(),
                website: faker.internet.url(),
                type_id: Factory.create('companytype')._id,
                phone_numbers: [{
                    number: faker.phone.phoneNumber(),
                    type: faker.random.word(),
                    is_default: true
                }],
                addresses: [{
                    address: faker.address.streetAddress(),
                    type: faker.random.word(),
                    is_default: true,
                    is_billing: true,
                    is_mail: true
                }]
            }

            const results = updateCompany._execute({userId:adminId}, companyData)

            assert.equal(results, 1)

            company = Companies.findOne({_id})
            assert.equal(company.name, companyData.name)
            assert.equal(company.website, companyData.website)
            assert.equal(company.type_id, companyData.type_id)
            assert.typeOf(company.phone_numbers, 'array')
            assert.equal(company.phone_numbers.length, 1)
            assert.deepEqual(company.phone_numbers[0], companyData.phone_numbers[0])
            assert.typeOf(company.addresses, 'array')
            assert.equal(company.addresses.length, 1)
            assert.deepEqual(company.addresses[0], companyData.addresses[0])
        })

        it('should remove company correctly by method', () => {
            let company = Factory.create('company')

            const _id = company._id

            removeCompany._execute({userId:adminId}, {_id})

            company = Companies.findOne({_id})
            assert.equal(company, null)
        })
    })
}