import {
    ADMIN_ROLE,
    SUPER_ADMIN_ROLE,
    STAKEHOLDER_ROLE,
    VENDOR_ROLE,
    EMPLOYEE_ROLE,
    SHIPPER_ROLE
} from '../../api/constants/roles';
import {Projects, Quotes } from '../../api/lib/collections';

Migrations.add({
    version: 1,
    name: 'Add roles',
    up() {
        console.log('up1 - Snapshots added');

        Roles.createRole(ADMIN_ROLE);
        Roles.createRole(SUPER_ADMIN_ROLE);
        Roles.createRole(STAKEHOLDER_ROLE);
        Roles.createRole(VENDOR_ROLE);
        Roles.createRole(EMPLOYEE_ROLE);
        Roles.createRole(SHIPPER_ROLE);
    },
    down() {
        console.log('down 0');
        Roles.deleteRole(ADMIN_ROLE);
        Roles.deleteRole(SUPER_ADMIN_ROLE);
        Roles.deleteRole(STAKEHOLDER_ROLE);
        Roles.deleteRole(VENDOR_ROLE);
        Roles.deleteRole(EMPLOYEE_ROLE);
        Roles.deleteRole(SHIPPER_ROLE);
    }
});

Meteor.startup(() => {
    Migrations.migrateTo(1);
});