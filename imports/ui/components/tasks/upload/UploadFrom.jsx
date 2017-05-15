import React, { Component, PropTypes } from 'react';

class UploadFrom extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className='upload-from'>
        <p className='text-center'>
          Upload From ...
          <a href='#' className='pull-right' onClick={event => this.props.close()}>
            <i className='fa fa-times'/>
          </a>
        </p>
        <div className='form'>
          <div className='form-group'>
            <button className='upload-option'>
              Computer
            </button>
          </div>
          <div className='form-group link'>
            Attach a link
            <input
              className='form-control input-sm'
              autoFocus={true}
              placeholder='paste any link here ...'
            />
          </div>
          <button className='btn btn-default btn-sm attach'>Attach</button>
        </div>
      </div>
    );
  }
}

UploadFrom.propTypes = {
  close: PropTypes.func.isRequired,
};

export default UploadFrom;
