import { Meteor } from 'meteor/meteor';

Meteor.methods({
    userRegistration(userData){
        const { username, email, password, firstName, lastName } = userData;
        let validation = {};
        if(Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`;
        if(Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`;

        if(JSON.stringify(validation) === '{}'){
            Accounts.createUser({
                username,
                email,
                password,
                profile: {
                    firstName,
                    lastName,
                    role: [
                        {role: 'user'}
                    ]
                }
            });
        }else{
            userData.validation = validation;
        }

        return userData;
    }
});
