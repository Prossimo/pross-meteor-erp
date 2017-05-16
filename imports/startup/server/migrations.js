import { Migrations } from 'meteor/percolate:migrations'
import {
    ADMIN_ROLE,
    SUPER_ADMIN_ROLE,
    STAKEHOLDER_ROLE,
    VENDOR_ROLE,
    EMPLOYEE_ROLE,
    SHIPPER_ROLE
} from '../../api/constants/roles'
import {CompanyTypes} from '/imports/api/models'

Migrations.add({
    version: 1,
    name: 'Add roles',
    up() {
        console.log('=== migrate up to version 1')
        Roles.createRole(ADMIN_ROLE);
        Roles.createRole(SUPER_ADMIN_ROLE);
        Roles.createRole(STAKEHOLDER_ROLE);
        Roles.createRole(VENDOR_ROLE);
        Roles.createRole(EMPLOYEE_ROLE);
        Roles.createRole(SHIPPER_ROLE);
    },
    down() {
        console.log('=== migrate down to version 1')
        Roles.deleteRole(ADMIN_ROLE);
        Roles.deleteRole(SUPER_ADMIN_ROLE);
        Roles.deleteRole(STAKEHOLDER_ROLE);
        Roles.deleteRole(VENDOR_ROLE);
        Roles.deleteRole(EMPLOYEE_ROLE);
        Roles.deleteRole(SHIPPER_ROLE);
    }
});
Migrations.add({
    version: 2,
    name: 'Add company types',
    up() {
        console.log('=== migrate up to version 2')
        const types = ['Architect', 'Engineer', 'Developer', 'Freight Forwarder', 'Energy Consultant', 'Shipping Line', 'Trucker', 'Procurement Consultat', 'Facade Consultant', 'Testing Lab', 'General Contractor', 'Installer', 'Fabricator', 'Glass Processor', 'Aluminum Extruder']

        types.forEach((type)=>CompanyTypes.insert({name:type}))
    },
    down() {
        console.log('=== migrate down to version 2')
    }
});

Meteor.startup(() => {
    if(!Meteor.isTest && !Meteor.isAppTest) {
        console.log('Started migration to version 2')
        Migrations.migrateTo(2);
    }
});
