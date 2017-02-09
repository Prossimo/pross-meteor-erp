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

export const getUserRoles = (user)=>{
    const { roles } = user;
    if(!user || !Array.isArray(roles)) return;
    if(roles.length == 1){
        return roles[0];
    }else if(roles.length > 1){
        let emails = '';
        roles.forEach(item=>{
            emails += `${item}, `;
        });
        emails = emails.slice(-2);
        return emails;
    }
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

export const getUserSignature = (user)=>{
    if(!user) return;
    const { profile } = user;
    return profile.signature ? profile.signature : '';
}