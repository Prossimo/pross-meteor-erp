import Reflux from 'reflux'
import _ from 'underscore'
import Actions from './actions'
import AccountStore from './account-store'
import NylasUtils from './nylas-utils'
import DraftStore from './draft-store'


class FileUploadStore extends Reflux.Store {
    constructor() {
        super()
        this.listenTo(Actions.addAttachment, this._onAddAttachment)
        this.listenTo(Actions.removeAttachment, this._onRemoveAttachment)
    }

    _onAddAttachment = ({clientId, file}) => {
        if(!clientId) throw new Error("You need to pass the ID of the message (draft) this Action refers to")

        this._verifyUpload(file)
            .then(this._generateId)
            .then((file)=>{
                DraftStore.addUploadToDraftForClientId(clientId, file)
            })
            .catch(this._onAttachFileError)
    }

    _onRemoveAttachment = ({clientId, file}) => {
        if(!file) return Promise.resolve()

        DraftStore.removeUploadFromDraftForClientId(clientId, file)
    }

    _verifyUpload = (file) => {
        if(file.size > 25 * 1000000)
            return Promise.reject(new Error(`${file.name} can not be attached because it is larger than 25MB.`))
        else
            return Promise.resolve(file)
    }

    _generateId = (file) => {
        file.id = NylasUtils.generateTempId()
        return Promise.resolve(file)
    }

    _onAttachFileError = (error) => {
        alert(error.message)
    }

}
module.exports = new FileUploadStore()