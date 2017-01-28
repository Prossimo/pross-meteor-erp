
export const createAdminUser = ()=>{
    if(!Meteor.users.findOne()){
        Accounts.createUser({
            username: "root",
            email: "root@admin.com",
            password: "asdfasdf",
            profile: {
                firstName: "Root",
                lastName: "Admin",
                role: [
                    {role: 'admin'}
                ]
            }
        });
    }
}
