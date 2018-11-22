import React, { Component } from "react";
import { Roles } from "meteor/alanning:roles";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Button } from "react-bootstrap";
import swal from "sweetalert2";
import { info, warning } from "/imports/api/lib/alerts";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  ROLES
  // Users,
  // ClientStatus,
  // SupplierStatus,
  // People
} from "/imports/api/models";
import EditableField from "./components/EditableField";
import * as columnsDetails from "./columnsDetails";

class SalesRecord extends Component {
  componentDidMount() {
    try {
      $('[data-toggle="tooltip"]').tooltip();
      $('[data-toggle="tooltip"]').on("show.bs.tooltip", function() {
        // Only one tooltip should ever be open at a time
        $(".tooltip")
          .not(this)
          .hide();
      });
    } catch (e) {}
  }

  removeProject = _id => {
    swal({
      title: "Are you sure ?",
      type: "warning",
      html: `
                <div class='form-group text-left'>
                <div class='checkbox'>
                    <label>
                    <input type='checkbox' checked id='confirm-remove-folders'/> Remove resource folders
                    </label>
                </div>
                <div class='checkbox'>
                    <label>
                    <input type='checkbox' checked id='confirm-remove-slack'/> Remove slack channel
                    </label>
                </div>
                </div>
            `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      preConfirm: () =>
        new Promise(resolve => {
          resolve({
            isRemoveFolders: $("#confirm-remove-folders").is(":checked"),
            isRemoveSlack: $("#confirm-remove-slack").is(":checked")
          });
        })
    }).then(({ isRemoveFolders, isRemoveSlack }) => {
      // console.log(isRemoveSlack, isRemoveFolders);
      Meteor.call(
        "removeSalesRecord",
        { _id, isRemoveFolders, isRemoveSlack },
        error => {
          if (error) {
            const msg = error.reason ? error.reason : error.message;
            return swal("remove deal failed", msg, "warning");
          }
          swal("Removed!", "Deal has been removed.", "success");
        }
      );
    });
  };

  archiveSalesRecord = _id => {
    swal({
      title: "Are you sure to archive this deal?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, archive it!"
    }).then(() => {
      Meteor.call("archiveSalesRecord", _id, true, error => {
        if (error) {
          const msg = error.reason ? error.reason : error.message;
          return swal("archiving deal failed", msg, "warning");
        }
        swal("Archive!", "Deal has been archived.", "success");
      });
    });
  };

  activeSalesRecord = _id => {
    Meteor.call("archiveSalesRecord", _id, false, error => {
      if (error) {
        const msg = error.reason ? error.reason : error.message;
        return swal("activating deal failed", msg, "warning");
      }
      swal("Active!", "Deal has been actived again.", "success");
    });
  };

  renderRecordButtons = ({ _id, archived }) => {
    return (
      <td>
        <div className="btn-group" style={{ width: "80px" }}>
          {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) && (
            <Button
              onClick={() => this.removeProject(_id)}
              bsStyle="danger"
              bsSize="small"
            >
              <i className="fa fa-trash" />
            </Button>
          )}
          {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) &&
            !archived && (
              <Button
                onClick={() => this.archiveSalesRecord(_id)}
                bsStyle="warning"
                bsSize="small"
              >
                <i className="fa fa-archive" />
              </Button>
            )}
          {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) &&
            archived && (
              <Button
                onClick={() => this.activeSalesRecord(_id)}
                bsStyle="success"
                bsSize="small"
              >
                <i className="fa fa-archive" />
              </Button>
            )}
        </div>
      </td>
    );
  };

  handleSave = property => {
    const {
      record: { _id },
      setEditField
    } = this.props;
    Meteor.call("updateProjectProperty", _id, property, error => {
      if (error)
        return warning(`Problems with updating project. ${error.error}`);

      setEditField(null);
      return info("Success update project");
    });
  };

  render() {
    const { columns, record, editing, setEditField } = this.props;
    return (
      <tr>
        {columns.map((col, idx) => {
          const colDetails = columnsDetails[col];
          return colDetails ? (
            <td key={idx} className={colDetails.editable ? "editable" : null}>
              {colDetails.editable ? (
                <EditableField
                  editing={editing}
                  setEditField={setEditField}
                  handleSave={this.handleSave}
                  record={record}
                  colDetails={colDetails}
                />
              ) : colDetails.renderer ? (
                colDetails.renderer(record)
              ) : (
                record[col]
              )}
            </td>
          ) : (
            <td key={idx}>{record[col]}</td>
          );
        })}
        {this.renderRecordButtons(record)}
      </tr>
    );
  }
}

export default SalesRecord;
