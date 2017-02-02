import {
    ADMIN_ROLE,
    SUPER_ADMIN_ROLE,
    STAKEHOLDER_ROLE,
    VENDOR_ROLE,
    EMPLOYEE_ROLE
} from '../../api/constatnts/roles';
import {Projects } from '../../api/lib/collections';

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
    },
    down() {
        console.log('down 0');
        Roles.deleteRole(ADMIN_ROLE);
        Roles.deleteRole(SUPER_ADMIN_ROLE);
        Roles.deleteRole(STAKEHOLDER_ROLE);
        Roles.deleteRole(VENDOR_ROLE);
        Roles.deleteRole(EMPLOYEE_ROLE);
    }
});

Migrations.add({
    version: 2,
    name: 'Add progect list',
    up() {
        console.log('up2 - Snapshots added');
        const projectList = [
            {
                name: "Project #1",
                status: "active",
                active: true
            },
            {
                name: "Project 2",
                status: "delivered",
                active: false
            },
            {
                name: "project 3",
                status: "active",
                active: true
            },
            {
                name: "project 4",
                status: "active",
                active: true
            },
            {
                name: "project 5",
                status: "delivered",
                active: false
            },
        ];

        projectList.forEach(item=>{
            Projects.insert(item)
        })
    },
    down() {
        console.log('down 1');
        Projects.remove({});
    }
});

Meteor.startup(() => {
    Migrations.migrateTo('latest');
});