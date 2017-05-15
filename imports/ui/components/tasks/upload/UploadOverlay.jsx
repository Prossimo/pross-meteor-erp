import React, { Component, PropTypes } from 'react';

class UploadOverlay extends Component {
  constructor() {
    super();
    this.state = {
      overlay: 'none',
    };
  }

  componentDidMount() {
    const taskElem = $('.task-details .modal-content')[0];
    taskElem.ondrop = (event)=> {
      event.preventDefault();
      this.setState({
        overlay: 'none',
      });
      const files = event.dataTransfer.files;
      console.log(files);
    };

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

export default UploadOverlay;
