import Actions from '/imports/api/nylas/actions'

fetchContact = () => {
    console.log('NylasSync->fetchContact')
    if(Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(nylasSyncInterval)
    }
}

const nylasSyncInterval = setInterval(fetchContact, 1 * 1000 * 6)