import React, { Component, PropTypes } from 'react';
import _ from 'underscore';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { info, warning } from '/imports/api/lib/alerts';
import { isValidEmail } from '/imports/api/lib/validation';
import { USER_ROLE_LIST } from '/imports/api/constants/roles';
import 'react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class EditableUsersTable extends Component{
  constructor(props){
    super(props);

    this.activeFormatterStatus = this.activeFormatterStatus.bind(this);
    this.usernameValidator = this.usernameValidator.bind(this);
    this.emailValidator = this.emailValidator.bind(this);
    this.onAfterInsertRow = this.onAfterInsertRow.bind(this);
    this.customConfirm = this.customConfirm.bind(this);
    this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    this.onBeforeSaveCell = this.onBeforeSaveCell.bind(this);
  }

  customConfirm(next, dropRowKeys) {
    const dropRowKeysStr = dropRowKeys.join(',');
    if (confirm(`(It's a custom confirm)Are you sure you want to delete ${dropRowKeysStr}?`)) {
      // If the confirmation is true, call the function that
      // continues the deletion of the record.
      Meteor.call('adminRemoveUser', dropRowKeysStr, (err) => {
        info('User was successfully removed!');
        next();
      });
    }
  }

  onAfterInsertRow(row) {
    const userData = {
      firstName: row.firstName,
      lastName: row.lastName,
      username: row.username,
      email: row.email,
      role: row.role
    };
    Meteor.call('adminCreateUser', userData, (err)=>{
      if (err) return warning(err.reason ? err.reason : err);
      info('Successful create user!');
    })
  }

  onAfterSaveCell(row, cellName, cellValue) {
    const userData = {
      _id: row._id,
      firstName: row.firstName,
      lastName: row.lastName,
      username: row.username,
      email: row.email,
      role: row.role
    };

    Meteor.call('adminEditUser', userData, (err)=>{
      info('User was successfully edited!');
    });
  }

  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    let validationStatus = true;

    let uniqueUsername = this.props.createdUsers.filter(person => { if (person.username !== cellValue) return true} );
    let uniqueEmail = this.props.createdUsers.filter(person => { if (person.email !== cellValue) return true} );
    if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
      validationStatus = false;
    }

    if (!_.isEqual(this.props.createdUsers, uniqueEmail)) {
      validationStatus = false;
    }
    return validationStatus;
  }

  // validator function pass the user input value and row object. In addition, a bool return value is expected
  usernameValidator(value, row) {
    const response = { isValid: true, notification: { type: 'success', msg: '', title: '' } };
    let uniqueUsername = this.props.createdUsers.filter(person => { if (person.username !== value) return true} );
    if (!value) {
      response.isValid = false;
      response.notification.type = 'error';
      response.notification.msg = 'Value must be inserted';
      response.notification.title = 'Requested Value';
    } else if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
      response.isValid = false;
      response.notification.type = 'error';
      response.notification.msg = 'Value must be unique';
      response.notification.title = 'Invalid Value';
    }
    return response;
  }

  // validator function pass the user input value and row object. In addition, a bool return value is expected
  emailValidator(value, row) {
    const response = { isValid: true, notification: { type: 'success', msg: '', title: '' } };
    let uniqueUsername = this.props.createdUsers.filter(person => { if (person.email !== value) return true} );
    if (!value) {
      response.isValid = false;
      response.notification.type = 'error';
      response.notification.msg = 'Value must be inserted';
      response.notification.title = 'Requested Value';
    } else if (!_.isEqual(this.props.createdUsers, uniqueUsername)) {
      response.isValid = false;
      response.notification.type = 'error';
      response.notification.msg = 'Value must be unique';
      response.notification.title = 'Invalid Value';
    } else if (!isValidEmail(value)) {
      response.isValid = false;
      response.notification.type = 'error';
      response.notification.msg = 'Please check your email input';
      response.notification.title = 'Invalid Value';
    }
    return response;
  }

  activeFormatterStatus(cell, row, enumObject, index) {
    return cell ? "Active" : "Not active yet";
  }

  render() {
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true
    };
    const options = {
      handleConfirmDeleteRow: this.customConfirm,
      afterInsertRow: this.onAfterInsertRow
    };
    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };

    const userRoles = USER_ROLE_LIST;

    const createdUsers = this.props.createdUsers.map(({ _id, username, profile: { firstName, lastName }, emails, roles })=> {
      return {
        _id,
        username,
        firstName,
        lastName,
        email: emails[0].address,
        role: roles[0],
        isActive: emails[0].verified,
      }
    })
    return (
      <BootstrapTable
        data={ createdUsers }
        insertRow={ true }
        pagination
        selectRow={ selectRowProp }
        deleteRow
        exportCSV
        cellEdit={ cellEditProp }
        options={ options }
      >
        <TableHeaderColumn
          dataField='_id'
          isKey={ true }
          hidden
          hiddenOnInsert
          autoValue={ true }
        >
          User Id
        </TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='firstName' dataSort={ true }>First Name</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='lastName' dataSort={ true }>Last Name</TableHeaderColumn>
        <TableHeaderColumn
          dataField='username'
          dataSort={ true }
          editable={ { type: 'input', validator: this.usernameValidator } }
        >
          Username
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='email'
          dataSort={ true }
          editable={ { type: 'input', validator: this.emailValidator } }
        >
          Email
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='isActive'
          dataSort={ true }
          dataFormat={ this.activeFormatterStatus }
          editable={ false }
          hiddenOnInsert
        >
          Status
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='role'
          dataSort={ true }
          editable={ { type: 'select', options: { values: userRoles } } }
        >
          Role
        </TableHeaderColumn>
      </BootstrapTable>
    )
  }
}

EditableUsersTable.propTypes = {
  createdUsers: PropTypes.array.isRequired,
}

export default  EditableUsersTable;
