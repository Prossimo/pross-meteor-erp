import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import { Migrations } from 'meteor/percolate:migrations'
import {ROLES, CompanyTypes, PeopleDesignations, Conversations, ClientStatus, SupplierStatus, SalesRecords, Projects, Tasks, NylasAccounts} from '/imports/api/models'
import {createProject} from '/imports/api/models/projects/methods'
import { slackClient } from '/imports/api/slack'

Migrations.add({
    version: 1,
    name: 'Add roles',
    up() {
        Object.values(ROLES).forEach((role) => {
            Roles.createRole(role)
        })
    },
    down() {

        Object.values(ROLES).forEach((role) => {
            Roles.deleteRole(role)
        })
    }
})
Migrations.add({
    version: 2,
    name: 'Add company types',
    up() {
        const types = ['Architect', 'Engineer', 'Developer', 'Freight Forwarder', 'Energy Consultant', 'Shipping Line', 'Trucker', 'Procurement Consultant', 'Facade Consultant', 'Testing Lab', 'General Contractor', 'Installer', 'Fabricator', 'Glass Processor', 'Aluminum Extruder']

        types.forEach((type) => CompanyTypes.insert({name:type}))
    },
    down() {
        CompanyTypes.remove({})
    }
})
Migrations.add({
    version: 3,
    name: 'Add people designations',
    up() {
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
            roles: ['Consultant']
        }]

        designations.forEach((d) => PeopleDesignations.insert({
            ...d,
            roles: d.roles.map(role => ({ name: role }))
        }))
    },
    down() {
        PeopleDesignations.remove({})
    }
})
Migrations.add({
    version: 4,
    name: 'Change designation role schema',
    up() {
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
        Conversations.remove()
        SalesRecords.update({}, {$set:{conversationIds:null}})
        Projects.update({}, {$set:{conversationIds:null}})
    }

})

Migrations.add({
    version: 8,
    name: 'Create projects for inboxes',
    up() {

        const nylasAccounts = _.uniq(NylasAccounts.find({isTeamAccount:true}).fetch(), false, ({emailAddress}) => emailAddress)

        nylasAccounts.forEach(({_id, name}) => {
            const project = Projects.findOne({nylasAccountId: _id})

            if(!project) {
                try {
                    createProject.call({name, nylasAccountId:_id, isServer:true})
                } catch (err) {
                    console.error(err)
                }
            }
        })
    },
    down() {
        Projects.remove({nylasAccountId:{$ne:null}})
    }
})

Migrations.add({
    version: 9,
    name: 'Add "Dealer" designation',
    up() {
        PeopleDesignations.insert({name:'Dealer', role_addable:false})
    },
    down() {

    }
})

Migrations.add({
    version: 10,
    name: 'Change slack channel field schema on salesrecord and project collections',
    up() {
        const {data:{ok, channels}} = slackClient.channels.list()
        if(ok && channels) {

            // 1. Update for salesrecords
            const salesRecords = SalesRecords.find().fetch()
            salesRecords.forEach((salesrecord) => {
                const slackChannel = {}
                if(salesrecord.slackChanel) {
                    const channel = channels.find(({id}) => id===salesrecord.slackChanel)
                    if(channel) {
                        slackChannel.id = channel.id
                        slackChannel.name = channel.name
                        slackChannel.isPrivate = false
                    }
                }
                console.log('SlackChannel for salesrecord5', slackChannel, salesrecord._id)
                SalesRecords.update({_id:salesrecord._id}, {$set:{slackChannel}})
            })

            // 2. Update for projects
            const projects = Projects.find().fetch()
            projects.forEach((project) => {
                const slackChannel = {}
                if(project.slackChanel) {
                    const channel = channels.find(({id}) => id===project.slackChanel)
                    if(channel) {
                        slackChannel.id = channel.id
                        slackChannel.name = channel.name
                        slackChannel.isPrivate = false
                    }
                }
                console.log('SlackChannel for project5', slackChannel, project._id)
                Projects.update({_id:project._id}, {$set:{slackChannel}})
            })
        }
    },
    down() {

    }
})

Migrations.add({
    version: 11,
    name: 'Initialize members to projects for inboxes',
    up() {
        const projects = Projects.find({nylasAccountId:{$ne:null}}).fetch()
        projects.forEach(project => {
            if(!project.members) Projects.update({_id:project._id}, {$set:{members:[]}})
        })
    },
    down() {
        Projects.remove({nylasAccountId:{$ne:null}})
    }
})

Migrations.add({
    version: 12,
    name: 'Remove slackChanel and slackChannelName fields from salesRecord and project',
    up() {
        SalesRecords.find({$or:[{slackChanel:{$ne:null}}, {slackChannelName:{$ne:null}}]}).map(({_id}) => {
            SalesRecords.update({_id}, {$unset:{slackChanel:1, slackChannelName:1}})
        })
        Projects.find({$or:[{slackChanel:{$ne:null}}, {slackChannelName:{$ne:null}}]}).map(({_id}) => {
            Projects.update({_id}, {$unset:{slackChanel:1, slackChannelName:1}})
        })
    },
    down() {

    }
})

Meteor.startup(() => {
    if(!Meteor.isTest && !Meteor.isAppTest) {
        Migrations.migrateTo(3)
    }
})
