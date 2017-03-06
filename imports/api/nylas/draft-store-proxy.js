import _ from 'underscore'

DraftStore = null

MetadataChangePrefix = 'metadata.'
class DraftChangeSet {
    constructor(_onTrigger, _onCommit) {
        this._commitChain = Promise.resolve()
        this._pending = {}
        this._saving = {}
        this._timer = null

        this._onTrigger = _onTrigger
        this._onCommit = _onCommit
    }


    teardown = () => {
        this._pending = {}
        this._saving = {}
        if (this._timer) {
            clearTimeout(this._timer)
            this._timer = null
        }
    }

    add = (changes, {silent} = {}) => {
        this._pending = _.extend(this._pending, changes)
        this._pending['pristine'] = false
        if (!silent) this._onTrigger()

        if (this._timer) clearTimeout(this._timer)
        this._timer = setTimeout(this.commit, 10000)
    }

    addPluginMetadata = (pluginId, metadata) => {
        changes = {}
        changes["#{MetadataChangePrefix}#{pluginId}"] = metadata
        this.add(changes)
    }

    commit = ({noSyncback}={}) => {
        this._commitChain = this._commitChain.finally(() => {
            if (Object.keys(this._pending).length == 0)
                return Promise.resolve(true)

            this._saving = this._pending
            this._pending = {}
            return this._onCommit({noSyncback}).then(() => {
                this._saving = {}
            })

        })
        return this._commitChain
    }

    applyToModel = (model) => {
        if (model) {
            changesToApply = _.pairs(this._saving).concat(_.pairs(this._pending))
            for ([key, val] of changesToApply) {
                if (key.startsWith(MetadataChangePrefix))
                    model.applyPluginMetadata(key.split(MetadataChangePrefix).pop(), val)
                else
                    model[key] = val
            }

        }
        return model
    }
}

class DraftStoreProxy {
    constructor(draftClientId, draft = null) {
        if (!DraftStore) DraftStore = require('./draft-store')

        this.listenTo(DraftStore, this._onDraftChanged)

        this._draft = false
        this._draftPristineBody = null
        this._destroyed = false

        this.changes = new DraftChangeSet(this._changeSetTrigger, this._changeSetCommit)

        if (draft)
            this._draftPromise = this._setDraft(draft)

        this.prepare()
    }

    draft = () => {
        if(!this.draft) return null

        this.changes.applyToModel(this._draft)
        return this._draft
    }

    _setDraft = (draft) => {
        if (!draft.body)
            throw new Error("DraftStoreProxy._setDraft - new draft has no body!")

        // We keep track of the draft's initial body if it's pristine when the editing
        // session begins. This initial value powers things like "are you sure you want
        // to send with an empty body?"
        if (draft.pristine)
            this._draftPristineBody = draft.body

        this._draft = draft
        this.trigger()

        return Promise.resolve(this)
    }

    prepare() {
        return this._setDraft(draft)
    }

    _onDraftChanged = (change) => {
        if (!change) return
        // We don't accept changes unless our draft object is loaded
        if (!this._draft) return

        // Is this change an update to our draft?
        myDrafts = _.filter(change.objects, (obj) => obj.clientId == this._draft.clientId)
        if (myDrafts.length > 0)
            this._draft = _.extend(this._draft, _.last(myDrafts))
        this.trigger()
    }

    _changeSetTrigger = () => {
        if (this._destroyed) return
        if (!this._draft)
            throw new Error("DraftChangeSet was modified before the draft was prepared.")
        this.trigger()
    }


    _changeSetCommit = ({noSyncback}={}) => {
        if(this._destroyed || !this._draft)
            return Promise.resolve(true)
        return Promise.resolve(true)
    }
}

DraftStoreProxy.DraftChangeSet = DraftChangeSet

module.exports = DraftStoreProxy
