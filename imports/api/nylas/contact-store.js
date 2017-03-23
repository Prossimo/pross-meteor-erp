import Reflux from 'reflux'
import QueryString from 'query-string'
import Actions from './actions'
import NylasAPI from './nylas-api'
import AccountStore from './account-store'
import RegExpUtils from './RegExpUtils'
import {Contacts} from '../models/contacts/contacts'
const LIMIT = 100

class ContactStore extends Reflux.Store {
    constructor() {
        super();

        this.contacts = [];
        this.loading = false;

        this.listenTo(Actions.loadContacts, this.onLoadContacts)

        console.log('======== ContactStore contact data ========', this.contacts)
    }

    onLoadContacts() {
        let accounts = AccountStore.accounts()

        if (!accounts || accounts.length == 0) return;


        loadContacts = (accountId, page) => {
            const query = QueryString.stringify({
                offset: (page - 1) * LIMIT,
                limit: LIMIT
            })

            NylasAPI.makeRequest({
                path: `/contacts?${query}`,
                method: 'GET',
                accountId: accountId
            }).then((result) => {
                //console.log("Nylas get contacts result", result);

                if (result && result.length) {
                    this.contacts = this.contacts.concat(result);

                    Meteor.call('insertOrUpdateContacts', result)
                    if (result.length == LIMIT) {
                        loadContacts(accountId, page + 1)
                    }
                }
            })
        }

        accounts.forEach((account) => {
            loadContacts(account.accountId, 1)
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
        //accountCount = AccountStore.accounts().length

        if (!search || search.length === 0) {
            return Promise.resolve([]);
        }

        const filter = {$regex: search, $options: 'i'}

        result = Contacts.find({$or: [{email: filter}, {name: filter}]}).fetch()
        console.log('=======COntacts search result', result, JSON.stringify({$or: [{email: filter}, {name: filter}]}))

        result = this._distinctByEmail(result)

        if (result.length > limit) result.length = limit


        return Promise.resolve(result)
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
