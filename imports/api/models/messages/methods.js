import Messages from './messages'


Meteor.methods({
    insertMessage(data)
    {
        /*check(data, {
            id: Match.Maybe(String),
            account_id: Match.Maybe(String),
            email: String,
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });*/

        return Messages.insert(data)
    }
});