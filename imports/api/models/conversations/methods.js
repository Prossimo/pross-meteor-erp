import Conversations from './conversations'

export const insertConversation = new ValidatedMethod({
    name: 'conversations.insert',
    validate: Conversations.simpleSchema().validator(),
    run(data) {
        return Conversations.insert(data)
    }
})