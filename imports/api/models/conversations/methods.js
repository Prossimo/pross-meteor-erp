import Conversations from './conversations'

export const insertConversation = new ValidatedMethod({
    name: 'conversations.insert',
    validate: Conversations.simpleSchema().validator(),
    run(data) {
        return Conversations.insert(data)
    }
})

Meteor.methods({
    insertConversation(data)
    {
        /*check(data, {
            id: Match.Maybe(String),
            account_id: Match.Maybe(String),
            email: String,
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });*/

        return Conversations.insert(data)
    }
});