import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { info, warning } from '/imports/api/lib/alerts';
import MediaUploader from '../libs/MediaUploader';

export default class Files extends Component {
    constructor(props) {
        super(props);
        this.addFile = this.addFile.bind(this);
        this.renderAttachFiles = this.renderAttachFiles.bind(this);
        this.renderRemoteFiles = this.renderRemoteFiles.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.token = null;
        this.state = {
            files: [],
            remoteFiles: [],
            loadingRemoteFiles: true,
        }
        check(props.project.folderId, String);
    }

    componentDidMount() {
        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
        });

        const folderId = this.props.project.folderId;
        Meteor.call('drive.listFiles', {query: `'${folderId}' in parents and trashed = false`}, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            this.setState({
                remoteFiles: result.files ,
                loadingRemoteFiles: false,
            });
        })
    }

    removeFile(fileId, event) {
        event.preventDefault();
        Meteor.call('drive.removeFiles', { fileId });
        this.setState((prevState)=> {
            prevState.remoteFiles = prevState.remoteFiles.filter(({ id })=> id !== fileId);
            return prevState;
        })
    }

    renderRemoteFiles() {
        return (
            <table className='table table-condensed'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.state.remoteFiles.map(({ name, id })=> {
                        return (
                            <tr key={id}>
                                <td>
                                    <div className='attached-file' key={id}>
                                        <span className='file-name'>{name}</span>
                                    </div>
                                </td>
                                <td className='text-right'>
                                    <a href='#' onClick={(event)=> this.removeFile(id, event)}>
                                        <span className='fa fa-times'/>
                                    </a>
                                </td>
                            </tr>
                        );
                    })
                }
                </tbody>
            </table>
        )
    }

    renderAttachFiles() {
        return (
            <div>
                {
                    this.state.files.map(({ name, id, uploaded })=> {
                        if (uploaded < 100) {
                            return (
                                <div className='attached-file' key={id}>
                                    <span className='file-name'>{name}</span>
                                    <ProgressBar active now={uploaded} style={{height: '5px', marginBottom: 0}}/>
                                </div>
                            );
                        }
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
                    parents: [this.props.project.folderId],
                },
                onProgress: ({ loaded, total })=> {
                    const percentage = Math.round(loaded/total * 100);
                    file.uploaded = percentage;
                    this.setState({ files: this.state.files });
                },
                onComplete: (remoteFile)=>  {
                    this.setState((prevState)=> {
                        prevState.remoteFiles.push(JSON.parse(remoteFile));
                        return prevState;
                    });
                }
            });
            uploader.upload();
        });
    }

    addFile(event) {
        event.preventDefault();
        let files = _.toArray(event.target.files).map((file)=> {
            file.id = Meteor.uuid();
            file.uploaded = 0;
            return file;
        });
        this.uploadFiles(files);
        this.setState({ files: this.state.files.concat(files) });
    }

    render() {
        return (
            <div className='file-tab default-form'>
                <div className='row'>
                    <div className='col-md-8'>
                        {
                            (this.state.loadingRemoteFiles) ? (
                                <div>Loading data from google drive .... </div>
                            ) : (
                                this.renderRemoteFiles()
                            )
                        }
                    </div>
                    <div className='col-md-4'>
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
                </div>
            </div>
        )
    }
}
