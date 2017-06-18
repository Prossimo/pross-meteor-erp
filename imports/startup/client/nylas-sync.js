import Actions from '/imports/api/nylas/actions'
import '/imports/api/nylas/contact-store'
import '/imports/api/nylas/thread-store'


const fetchContacts = () => {
    if (Meteor.userId()) {
        Actions.loadContacts()

        clearInterval(fetchContactsInterval)
    }
}
const fetchContactsInterval = setInterval(fetchContacts, 1 * 1000 * 6)

const fetchThreads = () => {
    if (Meteor.userId()) {
        Actions.loadThreads()
    }
}
setInterval(fetchThreads, 1 * 1000 * 6)
