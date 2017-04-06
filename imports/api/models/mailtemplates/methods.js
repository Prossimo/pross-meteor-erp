import _ from 'underscore';
import MailTemplates from './mailtemplates'

Meteor.methods({
    insertTemplate(data)
    {
        check(data, {
            subject: String,
            body: String
        });

        data.userId = Meteor.userId()
        const id = MailTemplates.insert(data)

        return MailTemplates.findOne({_id:id})
    },

    updateTemplate(id, data)
    {
        check(data, {
            subject: Match.Maybe(String),
            body: Match.Maybe(String)
        });

        const template = MailTemplates.findOne({_id:id})

        if(template.userId != Meteor.userId())
            throw new Meteor.Error('Can modify only your template')

        MailTemplates.update({_id:id}, {$set:data})

        return MailTemplates.findOne({_id:id})
    },

    removeTemplate(id)
    {
        const template = MailTemplates.findOne({_id:id})

        if(template.userId != Meteor.userId())
            throw new Meteor.Error('Can delete only your template')

        MailTemplates.remove({_id: id})
    }
});