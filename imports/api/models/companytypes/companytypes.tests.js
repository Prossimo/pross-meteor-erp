import {_} from 'meteor/underscore'
import {Meteor} from 'meteor/meteor'
import {chai, assert} from 'meteor/practicalmeteor:chai'
import {resetDatabase} from 'meteor/xolvio:cleaner'
import {Factory} from 'meteor/dburles:factory'
import { createAdminUser } from '/imports/api/models/users/methods'
import { insertCompanyType, updateCompanyType, removeCompanyType } from './methods'
import CompanyTypes from './companytypes'

if(Meteor.isServer) {
    describe('companytypes', () => {
        let adminId
        beforeEach(() => {
            resetDatabase()
            adminId = createAdminUser()
        })

        it('should insert company type correctly by factory and method', () => {
            let companyType = Factory.create('companytype')
            assert.typeOf(companyType, 'object')
            assert.typeOf(companyType.created_at, 'date')

            const data = {
                name: 'Freight Forwarder'
            }

            const companyTypeId = insertCompanyType._execute({userId:adminId}, data)

            assert.typeOf(companyTypeId, 'string')

            companyType = CompanyTypes.findOne({_id:companyTypeId})
            assert.equal(companyType.name, data.name)
        })

        it('should update company type correctly by method', () => {
            let companyType = Factory.create('companytype')

            const _id = companyType._id

            const data = {
                _id,
                name: 'Freight Forwarder'
            }

            const results = updateCompanyType._execute({userId:adminId}, data)

            assert.equal(results, 1)

            companyType = CompanyTypes.findOne({_id})
            assert.equal(companyType.name, data.name)
        })

        it('should remove company type correctly by method', () => {
            let companyType = Factory.create('companytype')

            const _id = companyType._id

            removeCompanyType._execute({userId:adminId}, {_id})

            companyType = CompanyTypes.findOne({_id})
            assert.equal(companyType, null)
        })
    })
}