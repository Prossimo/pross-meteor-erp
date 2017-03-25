import Actions from '/imports/api/nylas/actions'

fetchContact = () => {
    if(Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(nylasSyncInterval)
    }
}

const nylasSyncInterval = setInterval(fetchContact, 1 * 1000 * 6)