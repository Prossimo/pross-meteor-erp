import _ from "underscore";
import Task from "./task";
import Actions from "../actions";
import NylasAPI from "../nylas-api";
import DraftStore from "../draft-store";

export default class SyncbackDraftTask extends Task {
  constructor(clientId) {
    super();
    this.clientId = clientId;
    this.draft = _.clone(DraftStore.draftForClientId(clientId));
  }

  performRemote() {
    // console.log('SyncbackDraftTask performRemote', this.draft)
    if (this.draft.files && this.draft.files.length)
      this.draft.file_ids = _.pluck(this.draft.files, "id");

    return NylasAPI.makeRequest({
      accountId: this.draft.account_id,
      path: this.draft.id ? `/drafts/${this.draft.id}` : "/drafts",
      method: this.draft.id ? "PUT" : "POST",
      body: this.draft,
      returnsModel: false
    }).then(this.onSuccess);
  }

  onSuccess = response => {
    Actions.saveDraftSuccess({
      message: response,
      clientId: this.clientId
    });

    return Promise.resolve(Task.Status.Success);
  };
}
