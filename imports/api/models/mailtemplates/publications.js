import MailTemplates from './mailtemplates'

Meteor.publish('mailtemplates.all', function () {
    if(!this.userId) return this.ready()

    return MailTemplates.find()
})