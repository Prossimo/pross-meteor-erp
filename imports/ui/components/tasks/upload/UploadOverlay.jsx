import React, { Component, PropTypes } from 'react';
import MediaUploader from '../../libs/MediaUploader';

class UploadOverlay extends Component {
  constructor() {
    super();
    this.state = {
      overlay: 'none',
    };
  }

  componentDidMount() {
    const taskElem = $('.task-details .modal-content')[0];
    let token = '';
    Meteor.call('drive.getAccessToken', {}, (error, token)=> {
      if (error) {
        return warning('could not connect to google drive to attach files to current task');
      } else {
        taskElem.ondrop = (event)=> {
          event.preventDefault();
          this.setState({ overlay: 'none' });
          const files = event.dataTransfer.files;
          _.forEach(files, file => {
            const uploader = new MediaUploader({
              file,
              token,
              metadata: {
                parents: [this.props.taskFolderId],
              },
              onProgress({ loaded, total }) {

              },
              onComplete(remoteFile) {
                console.log(remoteFile);
              },
              onError() {

              },
            });
            uploader.upload();
          });
        };
      }
    });

    taskElem.ondragover = (event)=> {
      event.preventDefault();
    };

    taskElem.ondragenter = (event)=> {
      this.setState({
        overlay: '',
      });
    };

  }

  render() {
    return (
      <div className='attachment-overlay' style={{ display: this.state.overlay }}>
        <p>Drop Files to Upload.</p>
      </div>
    );
  }
}

UploadOverlay.propTypes = {
  taskFolderId: PropTypes.string,
};

export default UploadOverlay;
