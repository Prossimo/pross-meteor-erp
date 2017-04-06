import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { info, warning } from '/imports/api/lib/alerts';
import MediaUploader from '../libs/MediaUploader';

class Files extends Component {
    constructor(props) {
        super(props);
        this.addFile = this.addFile.bind(this);
        this.renderAttachFiles = this.renderAttachFiles.bind(this);
        this.renderRemoteFiles = this.renderRemoteFiles.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.removeFile = this.removeFile.bind(this);
        this.updateFolder = this.updateFolder.bind(this);
        this.addGooglefiles = this.addGooglefiles.bind(this);
        this.token = null;
        this.state = {
            files: [],
            remoteFiles: [],
            loadingRemoteFiles: true,
            folderId: "",
            msgstring: "",
        }
        switch(props.type) {
            case 'project':
                this.rootfolderId = props.project.folderId;
                if (!this.rootfolderId) warning('Your folder was not created yet')
                break;
            case 'salesRecord':
                this.rootfolderId = props.salesRecord.folderId;
                if (!this.rootfolderId) warning('Your folder was not created yet')
                break;
        }
        this.state.folderId = this.rootfolderId;
    }

    componentDidMount() {
        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
        });

        Meteor.call('drive.listFiles', {query: `'${this.state.folderId}' in parents and trashed = false`}, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            this.setState({
                remoteFiles: result.files ,
                loadingRemoteFiles: false,
            });
        })
    }

    updateFileList() {
        Meteor.call('drive.listFiles', {query: `'${this.state.folderId}' in parents and trashed = false`}, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            if (this.state.folderId != this.rootfolderId) {
                Meteor.call('drive.getParents', {fileId: this.state.folderId}, (err, parents)=> {
                    if (err) {
                        return warning('could not list files from google drive');
                    }
                    if (parents.parents.length > 1)
                        parents.parents = [this.rootfolderId];
                    result.files.unshift({
                        id: parents.parents.slice(-1)[0],
                        name: "..",
                        mimeType: "application/vnd.google-apps.folder"
                    });
                    this.setState({
                        remoteFiles: result.files,
                        loadingRemoteFiles: false,
                    });
                });
            } else {
                this.setState({
                    remoteFiles: result.files ,
                    loadingRemoteFiles: false,
                });
            }
        });
    }

    updateFolder(event) {
        let folderId = event.target.getAttribute('data-id');
        event.preventDefault();
        this.setState({folderId: folderId});

        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
        });

        this.updateFileList();
    }

    addGooglefiles(event) {
        event.preventDefault();
        var file_name = prompt('Please enter new file name', 'Create new file');

        if (file_name == null)
            return;
        var filetype = '';
        switch (event.target.getAttribute('data-val')) {
            case 'Docs':
                filetype = 'application/vnd.google-apps.document';
                break;
            case 'Spreadsheet':
                filetype = 'application/vnd.google-apps.spreadsheet';
                break;
            case 'Slide':
                filetype = 'application/vnd.google-apps.presentation';
                break;
            case 'Drawing':
                filetype = 'application/vnd.google-apps.drawing';
                break;
        }
        const file = {
            name: file_name,
            parent: this.state.folderId,
            filetype: filetype
        };
        this.setState({msgstring: 'Creating new Google '+event.target.getAttribute('data-val')+' file...'});

        Meteor.call('drive.getAccessToken', {}, (error, token)=> {
            if (error) {
                return warning('could not connect to google drive');
            }
            this.token = token;
        });

        Meteor.call('drive.createFile', file, (error, result)=> {
            if (error) {
                return warning('could not list files from google drive');
            }
            this.setState({msgstring: ''});
            this.updateFileList();
            //console.log ('successfully created google docs!');
        });
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
                    this.state.remoteFiles.map(({ name, id, mimeType })=> {
                        return (
                            <tr key={id}>
                                <td>
                                {
                                    (mimeType === 'application/vnd.google-apps.folder') ? (
                                        <div className='attached-folder' data-val={id}>
                                            <a href='#' >
                                                <span className='file-name' data-id={id} onClick={this.updateFolder}>{name}</span>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className='attached-file' key={id}>
                                            <a href={`https://www.googleapis.com/drive/v3/files/${id}?alt=media&access_token=${this.token}`} target='_blank'>
                                                <span className='file-name'>{name}</span>
                                            </a>
                                        </div>
                                    )
                                }
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
                    parents: [this.state.folderId],
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
                        <div>{this.state.msgstring}</div>
                        <a href={`https://drive.google.com/drive/folders/${this.state.folderId}`} target='_blank'>
                            <span className='file-name hand-cursor'>Open Folder</span>
                        </a>
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
                        <div className='text-center'>
                            <span className='label'>Add Google Docs file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Docs' value='Add Google Docs file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google SpreadSheet file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Spreadsheet' value='Add Google SpreadSheet file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google Slides file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Slide' value='Add Google Slides file'/>
                        </div>
                        <div className='text-center'>
                            <span className='label'>Add Google Drawing file</span>
                            <input type='button' className='hand-cursor' onClick={this.addGooglefiles} data-val='Drawing' value='Add Google Drawing file'/>
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

Files.propTypes  = {
    type: PropTypes.string.isRequired,
}
export default Files;
