import {Roles} from 'meteor/alanning:roles'
import { Migrations } from 'meteor/percolate:migrations'
import {ROLES, CompanyTypes, PeopleDesignations, Conversations, ClientStatus, SupplierStatus, SalesRecords, Projects} from '/imports/api/models'

Migrations.add({
    version: 1,
    name: 'Add roles',
    up() {
        console.log('=== migrate up to version 1')
        Object.values(ROLES).forEach((role) => {
            Roles.createRole(role)
        })
    },
    down() {
        console.log('=== migrate down to version 1')

        Object.values(ROLES).forEach((role) => {
            Roles.deleteRole(role)
        })
    }
})
Migrations.add({
    version: 2,
    name: 'Add company types',
    up() {
        console.log('=== migrate up to version 2')
        const types = ['Architect', 'Engineer', 'Developer', 'Freight Forwarder', 'Energy Consultant', 'Shipping Line', 'Trucker', 'Procurement Consultant', 'Facade Consultant', 'Testing Lab', 'General Contractor', 'Installer', 'Fabricator', 'Glass Processor', 'Aluminum Extruder']

        types.forEach((type) => CompanyTypes.insert({name:type}))
    },
    down() {
        console.log('=== migrate down from version 2')
        CompanyTypes.remove({})
    }
})
Migrations.add({
    version: 3,
    name: 'Add people designations',
    up() {
        console.log('=== migrate up to version 3')
        const designations = [{
            name: 'Stakeholder',
            role_addable: true,
            roles: ['Developer', 'Architect', 'GC', 'Contractor', 'Installer', 'Energy Consultant', 'Facade Consultant']
        },{
            name: 'Vendor',
            role_addable: true,
            roles: ['Window Producer', 'Screen Producer']
        },{
            name: 'Logistics',
            role_addable: true,
            roles: ['Freight Forwarder', 'Container Line', 'Broker', 'Trucking']
        },{
            name: 'Consultant',
            role_addable: true,
            roles: []
        }]

        designations.forEach((d) => PeopleDesignations.insert(d))
    },
    down() {
        console.log('=== migrate down from version 3')
        PeopleDesignations.remove({})
    }
})
Migrations.add({
    version: 4,
    name: 'Change designation role schema',
    up() {
        console.log('=== migrate up to version 4')
        const designations = [{
            name: 'Stakeholder',
            role_addable: true,
            roles: [{name:'Developer'}, {name:'Architect'}, {name:'GC'}, {name:'Contractor'}, {name:'Installer'}, {name:'Energy Consultant'}, {name:'Facade Consultant'}]
        },{
            name: 'Vendor',
            role_addable: true,
            roles: [{name:'Window Producer'}, {name:'Screen Producer'}]
        },{
            name: 'Logistics',
            role_addable: true,
            roles: [{name:'Freight Forwarder'}, {name:'Container Line'}, {name:'Broker'}, {name:'Trucking'}]
        },{
            name: 'Consultant',
            role_addable: true,
            roles: []
        }]

        designations.forEach((d) => {
            PeopleDesignations.update({name:d.name}, {$set:{roles:d.roles}})
        })
    },
    down() {
    }
})
Migrations.add({
    version: 5,
    name: 'Add empty array to participants field for conversation collection',
    up() {
        console.log('=== migrate up to version 5 ===')
        const conversations = Conversations.find().fetch()
        conversations.forEach(c => {
            if(!c.participants) {
                Conversations.update({_id:c._id}, {$set:{participants:[]}})
            }
        })
    },
    down() {}

})
Migrations.add({
    version: 6,
    name: 'Add ClientStatus and SupplierStatus',
    up() {
        console.log('==== migrate up to version 6 ====')

        const clientStatuses = ['Waiting on Client', 'Quote Sent', 'Change Requested', 'Intent To Buy', 'Client Accept', 'Submittal Sent', 'RFC', 'Stuck!']
        clientStatuses.forEach((status) => ClientStatus.insert({name:status,editable:false}))

        const supplierStatuses = ['Sent to Supplier', 'Pricing Received', 'RFC', 'Questions Asked', 'Info Received', 'Submittal Sent']
        supplierStatuses.forEach((status) => SupplierStatus.insert({name:status,editable:false}))
    },
    down() {}

})
Migrations.add({
    version: 7,
    name: 'Add conversationIds data to SalesRecord and Project',
    up() {
        console.log('===== migrate up to version 7 =====')

        // For SalesRecord
        const salesRecords = SalesRecords.find().fetch()
        salesRecords.forEach(s => {
            const conversations = Conversations.find({salesRecordId:s._id}).fetch()
            const mainConversationId = Conversations.insert({name:'Main', participants:(s.stakeholders||[]).filter(({peopleId}) => peopleId!=null).map(({peopleId, isMainStakeholder}) => ({peopleId, isMain:isMainStakeholder}))})
            SalesRecords.update(s._id, {$set:{conversationIds:[mainConversationId].concat(conversations.map(({_id}) => _id))}})
        })
        // For Project
        const projects = Projects.find().fetch()
        projects.forEach(p => {
            const mainConversationId = Conversations.insert({name:'Main', participants:(p.stakeholders||[]).filter(({peopleId}) => peopleId!=null).map(({peopleId, isMainStakeholder}) => ({peopleId, isMain:isMainStakeholder}))})
            Projects.update(p._id, {$set:{conversationIds:[mainConversationId]}})
        })
    },
    down() {
        console.log('==== migrate down to version 7 ====')
        Conversations.remove()
        SalesRecords.update({}, {$set:{conversationIds:null}})
        Projects.update({}, {$set:{conversationIds:null}})
    }

})
Meteor.startup(() => {
    if(!Meteor.isTest && !Meteor.isAppTest) {
        Migrations.migrateTo(7)
    }
})
