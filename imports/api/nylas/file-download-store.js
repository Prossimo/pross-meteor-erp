import Reflux from 'reflux'
import _ from 'underscore'
import fs from 'fs'
import path from 'path'
import Actions from './actions'

class FileDownloadStore extends Reflux.Store {
    constructor() {
        super()

        this.listenTo(Actions.fetchFile, this._fetch)
        this.listenTo(Actions.fetchAndOpenFile, this._fetchAndOpen)
        this.listenTo(Actions.fetchAndSaveFile, this._fetchAndSave)
        this.listenTo(Actions.fetchAndSaveAllFiles, this._fetchAndSaveAll)
        this.listenTo(Actions.abortFetchFile, this._abortFetchFile)

        this._downloads = {}

        this._downloadDirectory = path.join()
    }

    pathForFile = (file) => {
        if(!file) return undefined

        return ''
    }

    downloadDataForFile = (fileId) => {
        return this._downloads[fileId] ? this._downloads[fileId].data() : null
    }

    downloadDataForFiles = (fileIds=[]) => {
        let downloadData = {}
        fileIds.forEach((fileId)=>[
            downloadData[fileId] = this.downloadDataForFile(fileId)
        ])

        return downloadData
    }
}

module.exports = new FileDownloadStore()