import React, { Component, PropTypes } from 'react';

class Attachments extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <p>
          <strong><i className='fa fa-paperclip'/>&nbsp;&nbsp;&nbsp;Attachments</strong>
        </p>
        <div className='attachments'>
          <div className='attachment'>
            <div className='attachment-icon'>
              PDF
            </div>
            <div className='attachment-payload'>
              <div className='attachment-header'>
                Epidemic
              </div>
              <div className='attachment-time'>
                Added At 14/01/2016
              </div>
              <div className='attachment-controls'>
                <button className='attachment-control'>
                  <a href='#'><i className='fa fa-download'/> Download</a>
                </button>
                <button className='attachment-control'>
                  <a href='#'><i className='fa fa-times'/> Delete</a>
                </button>
              </div>
            </div>
          </div>
          <div className='attachment'>
            <div className='attachment-icon'>
              PDF
            </div>
            <div className='attachment-payload'>
              <div className='attachment-header'>
                Epidemic
              </div>
              <div className='attachment-time'>
                Added At 14/01/2016
              </div>
              <div className='attachment-controls'>
                <button className='attachment-control'>
                  <a href='#'><i className='fa fa-download'/> Download</a>
                </button>
                <button className='attachment-control'>
                  <a href='#'><i className='fa fa-times'/> Delete</a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Attachments;
