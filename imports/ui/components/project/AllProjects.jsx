import React from 'react';
import { Table } from 'react-bootstrap';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import { SHIPPING_MODE_LIST } from '/imports/api/constants/project';
import Select from 'react-select';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';

class AllProjects extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            edittingCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            possibleColumns: [
                {
                    key: '_id',
                    label: 'ID',
                    type: 'text',
                    selected: false,
                }, {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                    selected: true,
                },
                {
                    key: 'actualDeliveryDate',
                    label: 'Delivery Date',
                    selected: true,
                    type: 'date',
                },
                {
                    key: 'productionStartDate',
                    label: 'Start Date',
                    selected: false,
                    type: 'date',
                },
                {
                    key: 'shippingContactEmail',
                    label: 'Shipping Email',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shippingAddress',
                    label: 'Shipping Address',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shippingContactPhone',
                    label: 'Shipping Phone',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shippingNotes',
                    label: 'Shipping Notes',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'billingContactName',
                    label: 'Billing Contact',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'billingContactEmail',
                    label: 'Billing Email',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'billingAddress',
                    label: 'Billing Address',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'billingContactPhone',
                    label: 'Billing Phone',
                    selected: false,
                    type: 'text',
                },
                {
                    type: 'billingNotes',
                    label: 'Billing Notes',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shippingMode',
                    label: 'Shipping Mode',
                    selected: true,
                    type: 'select',
                    options: SHIPPING_MODE_LIST.map((value)=> ({label: value, value}))
                },
                {
                    key: 'supplier',
                    label: 'Supplier',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shipper',
                    label: 'Shipper',
                    selected: false,
                    type: 'text',
                },
                {
                    key: 'shippingContactName',
                    label: 'Shipping Name',
                    selected: false,
                    type: 'text',
                }
            ]
        }
        this.renderRows = this.renderRows.bind(this);
        this.allowEdit = this.allowEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.renderEditButton = this.renderEditButton.bind(this);
        this.renderSaveButton = this.renderSaveButton.bind(this);
    }

    handleMouseLeave() {
        this.setState({
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            }
        })
    }

    handleMouseEnter(key, rowIndex, value) {
        this.setState({
            hoverCell: {
                key,
                rowIndex,
                value
            }
        });
    }

    allowEdit(key, rowIndex, value) {
        this.setState({
            edittingCell: {
                key,
                rowIndex,
                value,
            }
        });
    }

    handleChange(value) {
        const edittingCell = this.state.edittingCell;
        edittingCell.value = value;
        this.setState({
            edittingCell,
        });
        // TODO: update value in this place
    }

    renderEditButton(key, index, value) {
        if (this.state.edittingCell.key) return;
        if (key === this.state.hoverCell.key && index === this.state.hoverCell.rowIndex) {
            return (
                <button
                    className='btn btn-sm pull-right btn-primary'
                    onClick={()=> this.allowEdit(key, index, value)}
                >
                    <i className='fa fa-pencil'/>
                </button>
            );
        }
    }

    renderSaveButton() {
        return (
            <button className='btn btn-warning btn-sm pull-right'>
                <i className='fa fa-save'/> Save
            </button>
        )

    }

    renderRows() {
        const selectedColumns = this.state.possibleColumns.filter(({ selected })=> selected);
        return this.props.projects.map((project, index)=> {
            return (
                <tr key={project._id}>
                {
                    selectedColumns.map(({ key, type, options })=> {
                        if (key === this.state.edittingCell.key && index === this.state.edittingCell.rowIndex) {
                            switch(type) {
                                case 'date':
                                    return (
                                        <td>
                                            <div>
                                                <DatePicker
                                                    selected={this.state.edittingCell.value}
                                                    onChange={this.handleChange}
                                                />
                                                { this.renderSaveButton() }
                                            </div>
                                        </td>
                                    )
                                case 'select':
                                    return (
                                        <td>
                                            <div>
                                                <Select
                                                    value={this.state.edittingCell.value}
                                                    options={options}
                                                    onChange={this.handleChange}
                                                />
                                                { this.renderSaveButton() }
                                            </div>
                                        </td>
                                    );
                                default:
                                    return (
                                        <td>
                                            <div>
                                                <input
                                                    type='text'
                                                    value={this.state.edittingCell.value}
                                                    onChange={(event) => this.handleChange(event.target.value)}
                                                />
                                                { this.renderSaveButton() }
                                            </div>
                                        </td>
                                    )
                                    break;
                            }
                        } else {
                            switch(type) {
                                case 'date':
                                    const date = moment(project[key]).format('MM/DD/YYYY');
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={()=> this.handleMouseEnter(key, index, moment(project[key]))}
                                        >
                                            <div>
                                                { date }
                                                { this.renderEditButton(key, index, moment(project[key])) }
                                            </div>
                                        </td>
                                    );
                                default:
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={()=> this.handleMouseEnter(key, index, project[key])}
                                        >
                                            <div>
                                                { project[key] }
                                                { this.renderEditButton(key, index, project[key]) }
                                            </div>
                                        </td>)
                            }
                        }
                    })
                }
                </tr>
            )
        })
    }

    renderProjectList(){
        const selectedColumns = this.state.possibleColumns.filter(({ selected })=> selected);
        return (
            <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    {
                        selectedColumns.map(({ label, key })=> {
                            return (
                                <th key={key}>{label}</th>
                            )
                        })
                    }
                  </tr>
                </thead>
                <tbody>
                    { this.renderRows() }
                </tbody>
              </Table>
        )
    }

    goToProject(project){
        FlowRouter.go("Project", {id: project._id})
    }

    componentDidMount() {
        const _this = this;
        const selectedFields = _this
            .state
            .possibleColumns
            .filter(({ selected })=> selected)
            .map(({ key })=> key)

        $('.selectpicker').selectpicker({
            style: 'btn-default',
            size: 4
        });

        $('.selectpicker').selectpicker('val', selectedFields);

        $('.selectpicker').on('changed.bs.select', function() {
            const selectedKeys = $(this).val();
            console.log(selectedKeys);
            const possibleColumns = _this.state.possibleColumns;
            possibleColumns.forEach((column)=> {
                if (selectedKeys.includes(column.key))
                    return column.selected = true;
                return column.selected = false;
            });
            _this.setState({ possibleColumns })
        })
    }

    render() {
        return (
           <div className="">
                <select className='selectpicker pull-right' multiple>
                {
                    this.state.possibleColumns.map(({ key, label })=> <option value={key} key={key}>{label}</option>)
                }
                </select>
               {this.renderProjectList()}
           </div>
          )
    }
}

export default  AllProjects;
