import React, { Component, PropTypes } from 'react';
import moment from 'moment';

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
          {
            this.props.attachments.map(({ mimeType, name, _id })=> {
              return (
                <div className='attachment' key={_id}>
                  <div className='attachment-icon'>
                    { _.last(mimeType.split('/')) }
                  </div>
                  <div className='attachment-payload'>
                    <div className='attachment-header'>
                    { name }
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
              );
            })
          }
        </div>
      </div>
    );
  }
}

Attachments.propTypes = {
  attachments: PropTypes.array,
};

export default Attachments;
