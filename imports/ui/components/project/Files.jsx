import React, { Component } from 'react';
import { info, warning } from '/imports/api/lib/alerts';
import MediaUploader from '../libs/MediaUploader';

export default class Files extends Component {
    constructor(props) {
        super(props);
        this.addFile = this.addFile.bind(this);
        this.renderAttachFiles = this.renderAttachFiles.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.token = null;
        this.folderId = null;
        this.state = {
            files: [],
            connected: false,
        }
    }

    componentDidMount() {
        const name = this.props.project.name;
        Meteor.call('drive.getFolderId', { name }, (error, folderId)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.folderId = folderId;
            this.setState({
                connected: !!this.folderId && !!this.token,
            });
        });
        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
            this.setState({
                connected: !!this.folderId && !!this.token,
            });
        });
    }

    renderAttachFiles() {
        return (
            <div>
                {
                    this.state.files.map(({ name }, index)=> {
                        return (
                            <div className='attached-file' key={index}>
                                <span className='file-name'>{name}</span>
                            </div>
                        );
                    })
                }
            </div>
        )
    }

    uploadFiles(files) {
        files.forEach((file)=> {
            const uploader = new MediaUploader({
                file,
                token: this.token,
                metadata: {
                    parents: [this.folderId],
                },
                onComplete(data) {
                    console.log(data);
                }
            });
            uploader.upload();
        });
    }

    addFile(event) {
        event.preventDefault();
        let files = _.toArray(event.target.files);
        this.uploadFiles(files);
        this.setState({ files: this.state.files.concat(files) });
    }

    render() {
        return (
            <div className='container default-form'>
                {
                    (this.state.connected) ? (
                        <div>
                            <div className='text-center'>
                                <span className='label'>Add pdf file</span>
                                <label htmlFor='quote-file'
                                   className='file-label'/>
                                <input type='file'
                                   id='quote-file'
                                   onChange={this.addFile}/>
                            </div>
                            <div>
                                {
                                    this.renderAttachFiles()
                                }
                            </div>
                        </div>
                    ) : (
                        <div>Retrieving data ....</div>
                    )
                }
            </div>
        )
    }
}
