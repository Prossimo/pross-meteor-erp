import React from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class EditableUsersTable extends React.Component{
  constructor(props){
    super(props);
  
    this.activeFormatterStatus = this.activeFormatterStatus.bind(this);
    this.onAfterDeleteRow = this.onAfterDeleteRow.bind(this);
    this.onAfterSaveCell = this.onAfterSaveCell.bind(this);
    this.onBeforeSaveCell = this.onBeforeSaveCell.bind(this);
  }
  
  onAfterDeleteRow(rowKeys) {
    alert('The rowkey you drop: ' + rowKeys);
  }
  
  onAfterSaveCell(row, cellName, cellValue) {
    alert(`Save cell ${cellName} with value ${cellValue}`);
    
    let rowStr = '';
    for (const prop in row) {
      rowStr += prop + ': ' + row[prop] + '\n';
    }
    
    alert('Thw whole row :\n' + rowStr);
  }
  
  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    return true;
  }
  
  activeFormatterStatus(cell, row, enumObject, index) {
    return cell ? "Active" : "Not active yet";
  }
  
  render() {
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true
    };
    const deleteRowOptions = {
      afterDeleteRow: this.onAfterDeleteRow
    };
    const cellEditProp = {
      mode: 'click',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };
    
    return (
      <BootstrapTable
        data={ this.props.createdUsers }
        pagination
        selectRow={ selectRowProp }
        deleteRow
        exportCSV
        cellEdit={ cellEditProp }
        options={ deleteRowOptions }
      >
        <TableHeaderColumn width='150' dataField='firstName' isKey={ true } dataSort={ true }>First Name</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='lastName' dataSort={ true }>Last Name</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='username' dataSort={ true }>Username</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='email' dataSort={ true }>Email</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='isActive' dataSort={ true } dataFormat={ this.activeFormatterStatus }>Status</TableHeaderColumn>
        <TableHeaderColumn width='150' dataField='role' dataSort={ true }>Role</TableHeaderColumn>
      </BootstrapTable>
    )
  }
}

export default  EditableUsersTable;