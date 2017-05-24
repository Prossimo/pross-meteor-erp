import React from 'react';
import { Table, Glyphicon, Button } from 'react-bootstrap';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import { SHIPPING_MODE_LIST } from '/imports/api/constants/project';
import { info, warning  } from '/imports/api/lib/alerts';
import Select from 'react-select';
import 'bootstrap-select';
import 'bootstrap-select/dist/css/bootstrap-select.min.css';
import KanbanView from './kanbanView/KanbanView'

class AllSalesRecords extends React.Component{
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
                _id: null,
            },
            possibleColumns: [
                {
                    key: '_id',
                    label: 'ID',
                    type: 'text',
                    selected: false,
                    editable: false,
                }, {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                    selected: false,
                    editable: true,
                },
                {
                    key: 'productionStartDate',
                    label: 'Start Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'actualDeliveryDate',
                    label: 'Delivery Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'shippingContactEmail',
                    label: 'Shipping Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingAddress',
                    label: 'Shipping Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactPhone',
                    label: 'Shipping Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingNotes',
                    label: 'Shipping Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactName',
                    label: 'Billing Contact',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactEmail',
                    label: 'Billing Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingAddress',
                    label: 'Billing Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactPhone',
                    label: 'Billing Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingNotes',
                    label: 'Billing Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingMode',
                    label: 'Shipping Mode',
                    selected: false,
                    type: 'select',
                    options: SHIPPING_MODE_LIST.map((value)=> ({label: value, value})),
                    editable: true,
                },
                {
                    key: 'supplier',
                    label: 'Supplier',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shipper',
                    label: 'Shipper',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactName',
                    label: 'Shipping Name',
                    selected: false,
                    type: 'text',
                    editable: true,
                }
            ],
						showKanbanView: false
        }
        this.renderRows = this.renderRows.bind(this);
        this.allowEdit = this.allowEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.renderEditButton = this.renderEditButton.bind(this);
        this.renderSaveButton = this.renderSaveButton.bind(this);
        this.updateProject = this.updateProject.bind(this);
				this.renderKanbanView = this.renderKanbanView.bind(this);
				this.renderSwitchLabels = this.renderSwitchLabels.bind(this);
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

    handleMouseEnter(key, rowIndex, value ) {
        const {editable} = this.state.possibleColumns.find((column)=> column.key === key);
        if (!editable) return;
        this.setState({
            hoverCell: {
                key,
                rowIndex,
                value
            }
        });
    }

    allowEdit(key, rowIndex, value, _id) {
        this.setState({
            edittingCell: {
                key,
                rowIndex,
                value,
                _id,
            }
        });
    }

    handleChange(value) {
        const edittingCell = this.state.edittingCell;
        edittingCell.value = value;
        this.setState({
            edittingCell,
        });
    }

    renderEditButton(key, index, value, _id) {
        if (this.state.edittingCell.key) return;
        if (key === this.state.hoverCell.key && index === this.state.hoverCell.rowIndex) {
            return (
                <button
                    className='btn btn-sm pull-right btn-primary'
                    onClick={()=> this.allowEdit(key, index, value, _id)}
                >
                    <i className='fa fa-pencil'/>
                </button>
            );
        }
    }

    updateProject() {
        // TODO: update salesRecord at here
        const { type } = this.state.possibleColumns.find(({ key })=> key === this.state.edittingCell.key);
        const _id = this.state.edittingCell._id;
        console.log(_id);
        let { key, value } = this.state.edittingCell;
        switch (type) {
            case 'date':
                value = value.toDate();
                break;
            case 'select':
                // When user did not select any new option
                value = value.value ? value.value : value;
                break;
            default:
                break;
        }
        Meteor.call('updateProjectProperty', _id, { key, value }, (error)=> {
            if(error) return warning(`Problems with updating project. ${error.error}`);
            this.handleMouseLeave();
            this.setState({
                edittingCell: {
                    key: null,
                    rowIndex: null,
                    value: null,
                    _id: null
                }
            });
            return info(`Success update project`);
        });
    }

    renderSaveButton() {
        return (
            <button
                className='btn btn-warning btn-sm pull-right'
                onClick={ this.updateProject }
            >
                <i className='fa fa-save'/> Save
            </button>
        )

    }

    renderRows() {
        const selectedColumns = this.state.possibleColumns.filter(({ selected })=> selected);
        const salesRecords =_.sortBy( this.props.salesRecords, ({ productionStartDate }) => -productionStartDate.getTime());
        return salesRecords.map((project, index)=> {
            return (
                <tr key={project._id}>
                {
                    selectedColumns.map(({ key, type, options })=> {
                        if (key === this.state.edittingCell.key && index === this.state.edittingCell.rowIndex) {
                            switch(type) {
                                case 'date':
                                    return (
                                        <td key={key}>
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
                                        <td key={key}>
                                            <div>
                                                <Select
                                                    style={{width: '60%'}}
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
                                        <td key={key}>
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
                                                { this.renderEditButton(key, index, moment(project[key]), project._id) }
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
                                                { this.renderEditButton(key, index, project[key], project._id) }
                                            </div>
                                        </td>)
                            }
                        }
                    })
                }
                <td><Button onClick={()=> this.goToProject(project)} bsSize='xsmall'><i className='fa fa-link'/> </Button></td>
                </tr>
            )
        })
    }

    renderProjectList(){
        const selectedColumns = this.state.possibleColumns.filter(({ selected })=> selected);
        return (
            <Table condensed hover>
                <thead>
                  <tr>
                    {
                      selectedColumns.map(({ label, key })=> {
                          return (
                              <th key={key}>{label}</th>
                          )
                      })
                    }
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                    { this.renderRows() }
                </tbody>
              </Table>
        )
    }

    goToProject(project){
        FlowRouter.go("SalesRecord", {id: project._id})
    }

    componentDidMount() {
        const _this = this;
        Meteor.call('getVisibleFields', 'salesRecord', (error, selectedFields)=> {
            if (!error) {
                const possibleColumns = _this.state.possibleColumns;
                possibleColumns.forEach((column)=> {
                    if (selectedFields.includes(column.key)) {
                        column.selected = true;
                    }
                });
                _this.setState({possibleColumns});

                $('.selectpicker').selectpicker({
                    style: 'btn-default',
                    size: 4
                });

                $('.selectpicker').selectpicker('val', selectedFields);

                $('.selectpicker').on('changed.bs.select', function() {
                    const selectedKeys = $(this).val();
                    const possibleColumns = _this.state.possibleColumns;
                    possibleColumns.forEach((column)=> {
                        if (selectedKeys.includes(column.key))
                            return column.selected = true;
                        return column.selected = false;
                    });
                    _this.setState({
                        hoverCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                        },
                        edittingCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                            _id: null,
                        },
                        possibleColumns
                    });
                    Meteor.call('updateVisibleFields', 'salesRecord', selectedKeys, (error)=> {

                    });
                })
            }
        });
    }
		renderKanbanView() {
			return (
				<KanbanView {...this.props} />
			)
		}
		renderSwitchLabels() {
			if (this.props.showAllDeals) {
				const active = this.state.showKanbanView ? 'active' : ''
				return (
					<div className="text-right input-group-btn">
						<button
							className={`btn btn-default ${!active ? 'active' : ''}`}
							onClick={()=>{
								this.setState({showKanbanView: false})
							}}
						>
							<span className="fa fa-list" aria-hidden="true"></span>
						</button>
						<button
							className={`btn btn-default ${active}`}
							onClick={()=>{
								this.setState({showKanbanView: true})
							}}
						>
							<span className="fa fa-align-left fa-rotate-90" aria-hidden="true"></span>
						</button>
					</div>
				)
			}
			return ''
		}
    render() {
	    return (
	       <div className="">
				 	{this.renderSwitchLabels()}
					<div className="col-md-12">&nbsp;</div>
					{
						this.props.showAllDeals && this.state.showKanbanView ?
							this.renderKanbanView()
						: (
							<div>
							 <select className='selectpicker pull-right' multiple>
							 {
									 this.state.possibleColumns.map(({ key, label })=> <option value={key} key={key}>{label}</option>)
							 }
							 </select>
							 <br/>
							 {this.renderProjectList()}
							</div>
						)
					}
	       </div>
	      )
    }
}

export default  AllSalesRecords;
