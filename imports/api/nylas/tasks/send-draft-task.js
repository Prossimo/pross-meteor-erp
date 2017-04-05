import Task from './task'
import Actions from '../actions'
import NylasAPI from '../nylas-api'
import {APIError} from '../errors'
import DraftStore from '../draft-store'
import AccountStore from '../account-store'

export default class SendDraftTask extends Task {
    constructor(clientId, {salesRecordId}={}) {
        super();
        this.clientId = clientId
        this.uploaded = [];
        this.draft = null;
        this.message = null;

        // For SalesRecord conversation
        this.salesRecordId = salesRecordId;
    }

    label() {
        return "Sending message...";
    }

    performRemote() {
        return this.assertDraftValidity()
            .then(this.sendMessage)
            .then((responseJSON) => {

                this.message = responseJSON
            })
            .then(this.onSuccess)
            .catch(this.onError);
    }

    assertDraftValidity = () => {
        this.draft = DraftStore.draftForClientId(this.clientId)

        if (!this.draft.from[0]) {
            return Promise.reject(new Error("SendDraftTask - you must populate `from` before sending."));
        }

        const account = AccountStore.accountForEmail(this.draft.from[0].email);
        if (!account) {
            return Promise.reject(new Error("SendDraftTask - you can only send drafts from a configured account."));
        }
        if (this.draft.account_id !== account.accountId) {
            return Promise.reject(new Error("The from address has changed since you started sending this draft. Double-check the draft and click 'Send' again."));
        }
        if (this.draft.uploads && (this.draft.uploads.length > 0)) {
            return Promise.reject(new Error("Files have been added since you started sending this draft. Double-check the draft and click 'Send' again.."));
        }
        return Promise.resolve();
    }

    sendMessage = () => {
        return NylasAPI.makeRequest({
            path: "/send",
            accountId: this.draft.account_id,
            method: 'POST',
            body: this.draft,
            timeout: 1000 * 60 * 5, // We cannot hang up a send - won't know if it sent
            returnsModel: false,
        })
            .catch((err) => {
                // If the message you're "replying to" were deleted
                if (err.message && err.message.indexOf('Invalid message public id') === 0) {
                    this.draft.reply_to_message_id = null
                    return this.sendMessage()
                }

                // If the thread was deleted
                if (err.message && err.message.indexOf('Invalid thread') === 0) {
                    this.draft.thread_id = null;
                    this.draft.reply_to_message_id = null;
                    return this.sendMessage();
                }

                return Promise.reject(err)
            });


    }

    onSuccess = () => {
        Actions.sendDraftSuccess({
            message: this.message,
            clientId: this.clientId,
            salesRecordId: this.salesRecordId
        });
        NylasAPI.makeDraftDeletionRequest(this.draft);

        return Promise.resolve(Task.Status.Success);
    }

    onError = (err) => {
        let message = err.message;

        if (err instanceof APIError) {
            if (!NylasAPI.PermanentErrorCodes.includes(err.statusCode)) {
                return Promise.resolve(Task.Status.Retry);
            }

            message = `Sorry, this message could not be sent. Please try again, and make sure your message is addressed correctly and is not too large.`;
            if (err.statusCode === 402 && err.body.message) {
                if (err.body.message.indexOf('at least one recipient') !== -1) {
                    message = `This message could not be delivered to at least one recipient. (Note: other recipients may have received this message - you should check Sent Mail before re-sending this message.)`;
                } else {
                    message = `Sorry, this message could not be sent because it was rejected by your mail provider. (${err.body.message})`;
                    if (err.body.server_error) {
                        message += `\n\n${err.body.server_error}`;
                    }
                }
            }
        }

        Actions.sendDraftFailed({
            threadId: this.draft.thread_id,
            clientId: this.clientId,
            errorMessage: message,
            salesRecordId: this.salesRecordId
        });


        return Promise.resolve([Task.Status.Failed, err]);
    }

}
