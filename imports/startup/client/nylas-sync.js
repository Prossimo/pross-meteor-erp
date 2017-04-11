import Actions from '/imports/api/nylas/actions'

fetchContacts = () => {
    if(Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(fetchContactsInterval)
    }
}

const fetchContactsInterval = setInterval(fetchContacts, 1 * 1000 * 6)

fetchThreads = () => {
    if(Meteor.userId()) {
        Actions.loadThreads()
    }
}

setInterval(fetchThreads, 1 * 1000 * 6)