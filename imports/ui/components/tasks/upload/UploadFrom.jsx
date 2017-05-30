import React, { Component, PropTypes } from 'react'

class UploadFrom extends Component {
  constructor() {
    super()
    this.pickLocalFile = this.pickLocalFile.bind(this)
    this.uploadFromLocal = this.uploadFromLocal.bind(this)
  }

  uploadFromLocal(event) {
    const modalElem = $('.task-details .modal-content')
    const dropEvent = new $.Event({ type: 'drop', files: event.target.files })
    this.props.close()
    modalElem.trigger('dragenter')
    modalElem.trigger(dropEvent)
  }

  pickLocalFile() {
    event.preventDefault()
    this.refs.file.click()
  }

  render() {
    return (
      <div className='upload-from'>
        <p className='text-center'>
          Upload From ...
          <a href='#' className='pull-right' onClick={() => this.props.close()}>
            <i className='fa fa-times'/>
          </a>
        </p>
        <div className='form'>
          <div className='form-group'>
            <input type='file' className='hide' ref='file' onChange={this.uploadFromLocal}/>
            <button className='upload-option' onClick={this.pickLocalFile}>
              Computer
            </button>
          </div>
          {/*
            <div className='form-group link'>
              Attach a link
              <input
                className='form-control input-sm'
                autoFocus={true}
                placeholder='paste any link here ...'
              />
            </div>
          <button className='btn btn-default btn-sm attach'>Attach</button>
          */}
        </div>
      </div>
    )
  }
}

UploadFrom.propTypes = {
  close: PropTypes.func.isRequired,
}

export default UploadFrom
