import Task from './task'
import NylasAPI from '../nylas-api'
import {APIError} from '../errors'
import DraftStore from '../draft-store'

export default class SyncbackDraftFilesTask extends Task {
    constructor(clientId) {
        super()
        this.clientId = clientId
        this._appliedUploads = null
        this._appliedFiles = null
        this.draft = DraftStore.draftForClientId(clientId)
    }

    label() {
        return "Uploading attachments...";
    }

    performRemote() {
        return this.uploadAttachments()
            .then(this.applyChangesToDraft)
            .thenReturn(Task.Status.Success)
            .catch((err) => {
                if (err instanceof BaseDraftTask.DraftNotFoundError) {
                    return Promise.resolve(Task.Status.Continue);
                }
                if (err instanceof APIError && !NylasAPI.PermanentErrorCodes.includes(err.statusCode)) {
                    return Promise.resolve(Task.Status.Retry);
                }
                return Promise.resolve([Task.Status.Failed, err]);
            });
    }

    uploadAttachments = () => {
        const uploaded = [].concat(this.draft.uploads);
        return Promise.all(uploaded.map(this.uploadAttachment)).then((files) => {
            // Note: We don't actually delete uploaded files until send completes,
            // because it's possible for the app to quit without saving state and
            // need to re-upload the file.
            this._appliedUploads = uploaded;
            this._appliedFiles = files;
        });
    }

    uploadAttachment = (upload) => {
        const formData = {
            file: upload
        }

        return NylasAPI.makeRequest({
            path: "/files",
            accountId: this.draft.accountId,
            method: "POST",
            json: false,
            formData,
            started: (req) =>{},
            timeout: 20 * 60 * 1000,
        })
            .finally(() => {

            })
            .then((rawResponseString) => {
                const file = JSON.parse(rawResponseString);
                console.log(file)
                return Promise.resolve(file);
            })
    }

    applyChangesToDraft = () => {
        this.draft.files = this.draft.files.concat(this._appliedFiles);
        if (this.draft.uploads instanceof Array) {
            const uploaded = this._appliedUploads
            this.draft.uploads = this.draft.uploads.filter((upload) =>
                !uploaded.includes(upload)
            );
        }
        return Promise.resolve(this.draft)
    }
}