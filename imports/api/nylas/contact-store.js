import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import RegExpUtils from './RegExpUtils'


class ContactStore extends Reflux.Store {
    constructor() {
        super();

        this.contacts = [];
        this.loading = false;

        this.listenTo(Actions.loadContacts, this.loadContacts)
    }

    loadContacts() {
        this.loading = true;
        this.trigger();

        NylasAPI.makeRequest({
            path: '/contacts',
            method: 'GET'
        }).then((result) => {
            console.log("Nylas get contacts result", result);

            if (result) {
                this.contacts = result;
            }
            this.loading = false;
            this.trigger();
        })
    }

    getAllContacts() {
        return this.contacts;
    }

    isLoading() {
        return this.loading;
    }

    parseContactsInString = (contactString, options = {}) => {
        const {skipNameLookup} = options

        detected = []
        emailRegex = RegExpUtils.emailRegex()
        lastMatchEnd = 0

        while (match = emailRegex.exec(contactString)) {
            email = match[0]
            name = null

            startsWithQuote = email[0] in ['\'', '"']
            hasTrailingQuote = contactString[match.index + email.length] in ['\'', '"']
            if (startsWithQuote && hasTrailingQuote)
                email = email.slice(1)

            hasLeadingParen = contactString[match.index - 1] in ['(', '<']
            hasTrailingParen = contactString[match.index + email.length] in [')', '>']

            if (hasLeadingParen && hasTrailingParen) {
                nameStart = lastMatchEnd
                for (char of [',', '\n', '\r']) {
                    i = contactString.lastIndexOf(char, match.index)
                    if (i + 1 > nameStart) nameStart = i + 1
                }
                name = contactString.substr(nameStart, match.index - 1 - nameStart).trim()
            }

            // The "nameStart" for the next match must begin after lastMatchEnd
            lastMatchEnd = match.index + email.length
            if (hasTrailingParen)
                lastMatchEnd += 1

            if (!name || name.length == 0)
                name = email

            // If the first and last character of the name are quotation marks, remove them
            firstChar = name[0], lastChar = name[name.length - 1];
            if (firstChar in ['"', "'"] && lastChar in ['"', "'"])
                name = name.slice(1, -1)

            detected.push(new Contact({email, name}))
        }

        if (skipNameLookup)
            return Promise.resolve(detected)

        Promise.all(
            detected.map((contact) => {
                if (contact.name != contact.email) return contact
                this.searchContacts(contact.email, {limit: 1}).then(([match]) => {
                    if (match && match.email == contact.email) return match
                    return contact
                })
            })
        )
    }

    searchContacts = (search, options = {}) => {
        let {limit} = options
        limit = limit ? limit : 5
        limit = Math.max(limit, 0)

        search = search.toLowerCase()
        accountCount = AccountStore.accounts().length

        if (!search || search.length === 0) {
            return Promise.resolve([]);
        }

        // Search ranked contacts which are stored in order in memory
        results = []
        for (contact of this._rankedContacts) {
            if (contact.email.toLowerCase().indexOf(search) != -1 || contact.name.toLowerCase().indexOf(search) != -1)
                results.push(contact)
            if (results.length == limit)
                return Promise.resolve(results)
        }

        queryResults = this.contacts.filter((c) => {
            return (c.email && c.email.indexOf(search) > -1) || (c.name && c.name.indexOf(search) > -1)
        })
        existingEmails = _.pluck(results, 'email')

        // remove query results that were already found in ranked contacts
        queryResults = _.reject(queryResults, (c) => c.email in existingEmails)
        queryResults = this._distinctByEmail(queryResults)

        results = results.concat(queryResults)
        if (results.length > limit) results.length = limit


        return Promise.resolve(results)
    }

    _distinctByEmail = (contacts) => {
        // remove query results that are duplicates, prefering ones that have names
        uniq = {}
        for (contact of contacts) {
            if (!contact.email) continue
            key = contact.email.toLowerCase()
            existing = uniq[key]
            if (!existing || (!existing.name || existing.name == existing.email))
                uniq[key] = contact
        }
        return _.values(uniq)
    }

    isValidContact = (contact) => {
        if (!contact instanceof Contact) return false
        if (!contact.email) return false

        // The email regexp must match the /entire/ email address
        result = RegExpUtils.emailRegex().exec(contact.email)
        if (result && result instanceof Array)
            return result[0] == contact.email
        else return false
    }

}

module.exports = new ContactStore()
