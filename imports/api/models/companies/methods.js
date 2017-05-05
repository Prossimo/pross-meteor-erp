import Companies from './companies'

Meteor.methods({
    insertCompany(data)
    {
        check(data, {
            id: Match.Maybe(String),
            name: String,
            website: String,
            type: String,
            phone_numbers: Match.Maybe(Array),
            addresses: Match.Maybe(Array)
        });

        data.user_id = Meteor.userId()
        return Companies.insert(data)
    },

    updateCompany(id, data)
    {
        check(data, {
            name: Match.Maybe(String),
            website: Match.Maybe(String),
            type: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array),
            addresses: Match.Maybe(Array)
        });

        return Companies.update({id}, data)
    },

    insertOrUpdateCompany(data)
    {
        check(data, {
            _id: Match.Maybe(String),
            name: Match.Maybe(String),
            website: Match.Maybe(String),
            type: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array),
            addresses: Match.Maybe(Array)
        });

        data.user_id = Meteor.userId()
        const {_id} = data
        if(_id) {
            const company = Companies.findOne({_id})
            if(!company) throw new Meteor.Error(`Could not find the company with _id:${_id}`)

            Companies.update({_id:_id}, {$set:data})
            return _id
        } else {
            return Companies.insert(data)
        }
    },

    removeCompany(_id)
    {
        const company = Companies.findOne({_id})

        if(!company)
            throw new Meteor.Error('Could not find entity')
        if(company.user_id != Meteor.userId())
            throw new Meteor.Error('You can not remove company of others')

        Companies.remove({_id})
    },
});