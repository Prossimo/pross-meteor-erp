import React, {PropTypes} from 'react'
import Spinner from '../utils/spinner'
import DraggableImg from '../utils/DraggableImg'
import AttachmentComponent from './attachment-component'


class ImageAttachmentComponent extends AttachmentComponent {
    static displayName = 'ImageAttachmentComponent';

    static propTypes = {
        file: PropTypes.object.isRequired,
        download: PropTypes.object,
        targetPath: PropTypes.string,
    };

    static containerRequired = false;

    _canAbortDownload() {
        return false
    }

    _imgOrLoader() {
        const {download, targetPath} = this.props
        if (download && download.percent <= 5) {
            return (
                <div style={{width: "100%", height: "100px"}}>
                    <Spinner visible/>
                </div>
            )
        } else if (download && download.percent < 100) {
            return (
                <DraggableImg src={`${targetPath}?percent=${download.percent}`}/>
            )
        }
        return <DraggableImg src={targetPath}/>
    }

    _renderRemoveIcon() {
        return (
            <img
                src="/icons/attachments/image-cancel-button.png"
            />
        )
    }

    _renderDownloadButton() {
        return (
            <img
                src="/icons/attachments/image-download-button.png"
            />
        )
    }

    render() {
        const {download, file} = this.props
        const state = download ? download.state || "" : ""
        const displayName = file instanceof File ? file.displayName() : file.name
        return (
            <div className={this.props.className}>
                <span className={`progress-bar-wrap state-${state}`}>
                  <span className="progress-background"></span>
                  <span className="progress-foreground" style={this._downloadProgressStyle()}></span>
                </span>
                {this._renderFileActionIcon()}
                <div className="file-preview" onDoubleClick={this._onClickView}>
                    <div className="file-name-container">
                        <div className="file-name">{displayName}</div>
                    </div>
                    {this._imgOrLoader()}
                </div>
            </div>
        )
    }
}

export default ImageAttachmentComponent
