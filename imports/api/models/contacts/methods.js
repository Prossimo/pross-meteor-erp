import _ from 'underscore';
import {Contacts} from './contacts'

Meteor.methods({
    insertContact(data)
    {
        check(data, {
            id: String,
            account_id: String,
            email: String,
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });

        return Contacts.insert(data)
    },

    updateContact(id, data)
    {
        check(data, {
            account_id: Match.Maybe(String),
            email: Match.Maybe(String),
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });

        return Contacts.update({id}, data)
    },

    insertOrUpdateContacts(data) {
        if (!data || data.length == 0) return null

        data = data.filter((item) => item.id && item.email && item.account_id)

        let existingContacts = Contacts.find({id: {$in: _.pluck(data, 'id')}}).fetch()

        let ids = []
        data.forEach((item) => {
            const {id, name} = item

            let contact = _.find(existingContacts, {id})

            if (contact) {
                if ((item.email && contact.email != item.email) ||
                    (item.name && contact.name != item.name) ||
                    (item.phone_numbers && item.phone_numbers.length && contact.phone_numbers != item.phone_numbers)) {
                    Contacts.update({id}, {$set: item})
                    ids.push(id)
                }
            } else {
                if(!name) item.name = item.email

                ids.push(Contacts.insert(item))
            }
        })

        return ids
    },

    removeContact(id)
    {
        Contacts.remove({_id: id})
    },
});