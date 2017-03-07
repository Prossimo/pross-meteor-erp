import Task from './task'
import Actions from '../actions'
import NylasAPI from '../nylas-api'
import {APIError} from '../errors'
import DraftStore from '../draft-store'
import AccountStore from '../account-store'

export default class SendDraftTask extends task {
    constructor(clientId) {
        super(clientId);
        this.uploaded = [];
        this.draft = null;
        this.message = null;
    }

    label() {
        return "Sending message...";
    }

    performRemote() {
        console.log("SendDraftTask->performRemote", this.clientId);
        return this.assertDraftValidity()
            .then(this.sendMessage)
            .then((responseJSON) => {
                console.log("Send message response", responseJSON)

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
        if (this.draft.account_id !== account.account_id) {
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
        Actions.sendDraftSuccess({message: this.message, clientId: this.clientId});
        NylasAPI.makeDraftDeletionRequest(this.draft);

        // Play the sending sound
        if (PlanckEnv.config.get("core.sending.sounds")) {
            SoundRegistry.playSound('send');
        }

        return Promise.resolve(Task.Status.Success);
    }

}
