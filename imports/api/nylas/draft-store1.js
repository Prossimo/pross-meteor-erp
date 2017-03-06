import Reflux from 'reflux'
import Actions from './actions'
import NylasAPI from './nylas-api'
import DraftFactory from './draft-factory'
import DraftStoreProxy from './draft-store-proxy'


class DraftStore extends Reflux.Store {
    constructor() {
        super();
        this.listenTo(Actions.composeNewBlankDraft, this.composeNewBlankDraft)

        this._draftSessions = {}

        this.composeModalStatus = {
            isOpenModal: false,
            title: null
        }
    }

    sessionForClientId = (clientId) => {
        if (!clientId)
            throw new Error("DraftStore::sessionForClientId requires a clientId")

        this._draftSessions[clientId] = this._draftSessions[clientId] || this._createSession(clientId)

        return this._draftSessions[clientId].prepare()
    }

    _createSession = (clientId, draft) => {
        this._draftSessions[clientId] = new DraftStoreProxy(clientId, draft)
    }

    composeNewBlankDraft() {
        DraftFactory.createDraft().then((draft) =>
            this._finalizeAndPersistNewMessage(draft).then(({draftClientId}) =>
                this._onPopoutDraftClientId(draftClientId, {newDraft: true})
            )
        )
    }

    _finalizeAndPersistNewMessage = (draft, {popout} = {}) => {
        // Optimistically create a draft session and hand it the draft so that it
        // doesn't need to do a query for it a second from now when the composer wants it.

        //this._createSession(draft.clientId, draft)

        if (popout)
            this._onPopoutDraftClientId(draft.clientId)
        else
            Actions.focusDraft({draftClientId: draft.clientId})

        return ({draftClientId: draft.clientId, draft: draft})
    }

    _onPopoutDraftClientId = (draftClientId, options = {}) => {
        if (!draftClientId)
            throw new Error("DraftStore::onPopoutDraftId - You must provide a draftClientId")

        /*draftJSON = null
        save = Promise.resolve()
        if (this._draftSessions[draftClientId]) {
            save = this._draftSessions[draftClientId].changes.commit()
            draftJSON = this._draftSessions[draftClientId].draft().toJSON()
        }*/

        title = options.newDraft ? "New Message" : "Message"

        /*save.then(() => {
            this.composeModalStatus = {
                isOpenModal: true,
                title: title
            }
        })*/

        this.composeModalStatus = {
            isOpenModal: true,
            title: title
        }
    }
}

module.exports = new DraftStore()
