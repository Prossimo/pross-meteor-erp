
import AccountStore from './account-store'
import NylasUtils from './nylas-utils'
import DOMUtils from '/imports/ui/utils/dom-utils'


class DraftFactory {
    createDraft = (fields = {}) => {
        account = fields.account_id ? AccountStore.accountForAccountId(fields.account_id) : AccountStore.getSelectedAccount()
        if (!account) return Promise.reject(new Error('Could not get Nylas account info'))

        return Promise.resolve({
            body: fields.body || '',
            subject: fields.subject || '',
            clientId: NylasUtils.generateTempId(),
            from: fields.from || [NylasUtils.defaultMe(account)],
            to: fields.to || [],
            cc: fields.cc || [],
            bcc: fields.bcc || [],
            date: new Date().getTime() / 1000,
            account_id: account.accountId
        })
    }

    createDraftForReply = ({thread, message, type}) => {
        const {to, cc} = type == 'reply-all' ? NylasUtils.participantsForReplyAll(message) : NylasUtils.participantsForReply(message)

        return this.createDraft({
            subject: NylasUtils.subjectWithPrefix(message.subject, 'Re:'),
            to: to,
            cc: cc,
            thread_id: thread.id,
            reply_to_message_id: message.id,
            account_id: message.account_id,
            body: `<br><br><div class="gmail_quote">
            ${DOMUtils.escapeHTMLCharacters(NylasUtils.replyAttributionLine(message))}
            <br>
            <blockquote class="gmail_quote"
              style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding-left:1ex;">
              ${message.body}
            </blockquote>
          </div>`
        })
    }

    createDraftForForward = ({thread, message}) => {
        contactsAsHtml = (cs) => DOMUtils.escapeHTMLCharacters(cs.map((c)=>NylasUtils.contactDisplayFullname(c)).join(', '));
        let fields = [];
        if (message.from.length > 0) fields.push(`From: ${contactsAsHtml(message.from)}`)
        fields.push(`Subject: ${message.subject}`)
        fields.push(`Date: ${NylasUtils.formattedDateForMessage(message)}`)
        if (message.to.length > 0) fields.push(`To: ${contactsAsHtml(message.to)}`)
        if (message.cc.length > 0) fields.push(`Cc: ${contactsAsHtml(message.cc)}`)

        return this.createDraft({
            subject: NylasUtils.subjectWithPrefix(message.subject, 'Fwd:'),
            files: [].concat(message.files),
            thread_id: thread.id,
            account_id: message.account_id,
            body: `<br><br><div class="gmail_quote">
            ---------- Forwarded message ---------
            <br><br>
            ${fields.join('<br>')}
            <br><br>
            ${message.body}
          </div>`
        })
    }

}

module.exports = new DraftFactory()