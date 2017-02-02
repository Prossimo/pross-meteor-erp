//filters for user model
const userSchema = {
    "_id": "vJCpYSFfodTnP9Zz7",
    "createdAt": new Date(),
    "username": "root",
    "emails": [
        {
            "address": "root@admin.com",
            "verified": false
        }
    ],
    "profile": {
        "firstName": "Root",
        "lastName": "Admin",
        "role": [
            {
                "role": "admin"
            }
        ]
    },
    "roles": [
        "superAdmin"
    ]
}

export const getUserName = (user, full)=>{
    if(!user) return;
    const { username } = user;
    const { firstName, lastName } = user.profile;

    if(!full && username) return username;
    if(firstName && lastName ) return `${firstName} ${lastName}`;

    return firstName ? firstName : lastName ? lastName : 'guest';
};

export const getUserEmail = (user)=>{
    if(!user) return;
    const { emails } = user;
    if(emails[0].address) return emails[0].address;
};