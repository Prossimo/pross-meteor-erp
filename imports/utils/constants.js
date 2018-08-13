export const PAGESIZE = 20
export const DEALS = {
    GROUP_BY: {
        STAGE: 'stage',
        SUBSTAGE: 'subStage'
    },
    ORDER: {
        ASC: 1,
        DESC: -1
    }
}

export const PAGES = [{
        label: 'Dashboard',
        route: 'Dashboard'
    }, {
        label: 'Inbox',
        route: 'Inbox'
    },
    {
        label: 'Projects',
        route: 'Projects',
    },
    {
        label: 'Deals',
        route: 'Deals',
        subItems: [{
                label: 'Leads',
                route: 'Leads'
            },
            {
                label: 'Opportunities',
                route: 'Opportunities'
            },
            {
                label: 'Orders',
                route: 'Orders'
            },
            {
                label: 'Tickets',
                route: 'Tickets'
            },
        ]
    },
    {
        label: 'Contacts',
        subItems: [{
                label: 'People',
                route: 'People'
            },
            {
                label: 'Companies',
                route: 'Companies'
            },
            {
                label: 'Email Contacts',
                route: 'Contacts'
            }

        ]
    },
    {
        label: 'Financial',
        route: 'Financial'
    },
    {
        label: 'Settings',
        subItems: [{
                label: 'Account',
                route: 'Account'
            },
            {
                label: 'Inbox',
                route: 'InboxSettings'
            },
        ]
    }
]
