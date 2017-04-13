import Actions from '/imports/api/nylas/actions'
import '/imports/api/nylas/contact-store'
import '/imports/api/nylas/thread-store'


fetchContacts = () => {
    if (Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(fetchContactsInterval)
    }
}

const fetchContactsInterval = setInterval(fetchContacts, 1 * 1000 * 6)

fetchThreads = () => {
    if (Meteor.userId()) {
        Actions.loadThreads()
    }
}

setInterval(fetchThreads, 1 * 1000 * 6)

fetchSalesRecordThreads = () => {
    if (Meteor.userId()) {
        Actions.fetchSalesRecordThreads()
    }
}

setInterval(fetchSalesRecordThreads, 1 * 1000 * 6)