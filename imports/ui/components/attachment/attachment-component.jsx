import fs from 'fs'
import path from 'path'
import React, {Component, PropTypes} from 'react'
import NylasUtils from '../../../api/nylas/nylas-utils'
import Actions from '../../../api/nylas/actions'
import FileDownloadStore from '../../../api/nylas/file-download-store'


class AttachmentComponent extends Component {
    static displayName = 'AttachmentComponent';

    static propTypes = {
        file: PropTypes.object.isRequired,
        download: PropTypes.object,
        removable: PropTypes.bool,
        targetPath: PropTypes.string,
        messageClientId: PropTypes.string,
    };

    constructor() {
        super()
        this.state = {progressPercent: 0}
    }

    static containerRequired = false;

    _isDownloading() {
        const {download} = this.props
        const state = download ? download.state : null
        return state === 'downloading'
    }

    _canClickToView() {
        return !this.props.removable
    }

    _canAbortDownload() {
        return true
    }

    _downloadProgressStyle() {
        const {download} = this.props
        const percent = download ? download.percent || 0 : 0;
        return {
            width: `${percent}%`,
        }
    }

    _onDragStart = (event) => {
        const {file} = this.props
        const filePath = FileDownloadStore.pathForFile(file)
        if (fs.existsSync(filePath)) {
            // Note: From trial and error, it appears that the second param /MUST/ be the
            // same as the last component of the filePath URL, or the download fails.
            const DownloadURL = `${file.contentType}:${path.basename(filePath)}:file://${filePath}`
            event.dataTransfer.setData("DownloadURL", DownloadURL)
            event.dataTransfer.setData("text/nylas-file-url", DownloadURL)
        } else {
            event.preventDefault()
        }
    };

    _onClickView = () => {
        if (this._canClickToView()) {
            Actions.downloadFile(this.props.file)
        }
    };

    _onClickRemove = (event) => {
        Actions.removeFile({
            file: this.props.file,
            messageClientId: this.props.messageClientId,
        })
        event.stopPropagation() // Prevent 'onClickView'
    };

    _onClickDownload = (event) => {
        Actions.downloadFile(this.props.file)
        event.stopPropagation() // Prevent 'onClickView'
    };

    _onClickAbort = (event) => {
        Actions.abortDownloadFile(this.props.file)
        event.stopPropagation() // Prevent 'onClickView'
    };

    _renderRemoveIcon() {
        return (
            <img
                src="/icons/attachments/remove-attachment.png"
            />
        )
    }

    _renderDownloadButton() {
        return (
            <img
                src="/icons/attachments/icon-attachment-download.png"
            />
        )
    }

    _renderFileActionIcon() {
        if (this.props.removable) {
            return (
                <div className="file-action-icon" onClick={this._onClickRemove}>
                    {this._renderRemoveIcon()}
                </div>
            )
        } else if (this._isDownloading() && this._canAbortDownload()) {
            return (
                <div className="file-action-icon" onClick={this._onClickAbort}>
                    {this._renderRemoveIcon()}
                </div>
            )
        }
        return (
            <div className="file-action-icon" onClick={this._onClickDownload}>
                {this._renderDownloadButton()}
            </div>
        )
    }

    render() {
        const {file, download} = this.props;
        const downloadState = download ? download.state || "" : "";

        return (
            <div className={this.props.className}>
                <div className="inner" onDoubleClick={this._onClickView} onDragStart={this._onDragStart}
                     draggable="true">
        <span className={`progress-bar-wrap state-${downloadState}`}>
          <span className="progress-background"/>
          <span className="progress-foreground" style={this._downloadProgressStyle()}/>
        </span>

                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', height:'100%'}}>
                        <div className="file-info-wrap">
                            <img
                                className="file-icon"
                                src={`/icons/attachments/${NylasUtils.fileIcon(file)}`}
                            />
                            <span className="file-name">{NylasUtils.displayNameForFile(file)}</span>
                            <span className="file-size">{NylasUtils.displayFileSize(file)}</span>
                        </div>
                        {this._renderFileActionIcon()}
                    </div>
                </div>
            </div>
        )
    }
}

export default AttachmentComponent
