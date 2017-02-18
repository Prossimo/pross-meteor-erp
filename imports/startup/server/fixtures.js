import {resetDatabase} from 'meteor/xolvio:cleaner';
import {SUPER_ADMIN_ROLE, EMPLOYEE_ROLE} from '../../api/constants/roles'
import {Projects, Quotes} from '../../api/lib/collections';

function createBaseData() {
    // 1. Generate user data
    const administrator = {
        username: 'admin',
        email: 'admin@prossimo.com',
        password: 'prossimo2017',
        profile: {
            firstName: "Prossimo",
            lastName: "Admin",
            role: [
                {role: 'admin'}
            ]
        }
    };
    const adminId = Accounts.createUser(administrator);
    Roles.addUsersToRoles(adminId, [SUPER_ADMIN_ROLE]);

    const user1 = {
        username: 'prossimo1',
        email: 'quotes@prossimo.us',
        password: 'P4ssiveH0use',
        profile: {
            firstName: "Quote",
            lastName: "User",
            role: [
                {role: 'user'}
            ]
        }
    };
    const userId1 = Accounts.createUser(user1);
    Roles.addUsersToRoles(userId1, [EMPLOYEE_ROLE]);

    console.log("=========== Created user data ===========");

    // 2. Generate project data
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

    projectList.forEach(item => {
        Projects.insert(item)
    })
    console.log("=========== Created project data ===========");

    const quoteList = [
        {
            name: "Quote #1",
            revisionNumber: "active",
            active: true,
            fileLink: '',
            createAt: new Date()
        },
            {
                name: "Quote 2",
                status: "delivered",
                active: false,
                fileLink: '',
                createAt: new Date()
            }
        ];
    quoteList.forEach(item => {
        Quotes.insert(item)
    })
    console.log("=========== Created quote data ===========");

}

if (Meteor.isAppTest) {
    resetDatabase();

    createBaseData();
}