import React, { Component } from "react";
import styled from "styled-components";
import { compose, withHandlers, withState } from "recompose";
import PropTypes from "prop-types";

class DropOverlay extends Component {
  render() {
    const { children, handleDrop, handleDrag, isDrag } = this.props;
    const Indicator = styled.div`
      position: fixed;
      text-align: center;
      left: calc(50% - 70px);
      bottom: 20px;
      color: #5b8bff;
      p {
        background-color: white;
        -webkit-box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        padding: 5px;
        border-radius: 5px;
      }
    `;
    return (
      <div onDrop={handleDrop} onDragOver={handleDrag}>
        {children}
        {isDrag ? (
          <Indicator className="animated bounceInUp">
            <i className="fa fa-cloud-upload fa-3x" />
            <br />
            <p>
              <strong>
                Drop files to instantly upload <br /> to current folder
              </strong>
            </p>
          </Indicator>
        ) : (
          ""
        )}
      </div>
    );
  }
}

DropOverlay.propTypes = {
  uploader: PropTypes.object
};

export default compose(
  withState("isDrag", "toggleDrag", false),
  withHandlers({
    handleDrop: ({ toggleDrag, uploader }) => event => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      toggleDrag(false);
      const customEvent = {
        target: {
          files
        }
      };
      uploader.uploadFile(customEvent);
    },
    handleDrag: ({ toggleDrag }) => event => {
      event.preventDefault();
      toggleDrag(true);
    }
  })
)(DropOverlay);
