import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Modal,
  Button,
} from 'react-bootstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { createContainer } from 'meteor/react-meteor-data';
import { Tasks } from '/imports/api/lib/collections';

class TasksView extends Component {
  constructor(props) {
    super(props);
    this.getValidationState = this.getValidationState.bind(this);
    this.changeState = this.changeState.bind(this);
    this.addTask = this.addTask.bind(this);
    this.openModal = this.openModal.bind(this);
    this.state = {
      task: {
        name: '',
        dueDate: new Date(),
        description: '',
        assignee: '',
        approver: '',
      },
      showModal: false,
      editName: false,
      editDescription: false,
      employees: [],
    };
    const taskSchema = new SimpleSchema({
      name: {
        type: String,
      },
      assignee: {
        type: String,
      },
      approver: {
        type: String,
        optional: true,
      },
      description: {
        type: String,
      },
      dueDate: {
        type: Date,
      },
      status: {
        type: String,
        allowedValues: [
          'Idea',
          'Planned',
          'In Progress',
          'Complete',
          'Blocked',
        ],
      },
    });
    this.state.taskSchema = taskSchema;
    this.state.context = taskSchema.newContext();
  }

  componentDidMount() {
    Meteor.call('task.getEmployees', {}, (error, employees)=> {
      if (!error) {
        this.setState({
          employees,
        });
      }
    });
  }

  changeState(propElem, propKey, propValue) {
    propElem[propKey] = propValue;
    this.setState((prevState)=> prevState);
  }

  addTask() {
    const task = this.state.taskSchema.clean(this.state.task);
    this.state.context.validate(task);
    this.setState((prevState)=> prevState);
  }

  openModal(event) {
    event && event.preventDefault();
    this.setState({
      showModal: true,
    });
  }

  getValidationState(key) {
    const invalidKeys = this.state.context.invalidKeys().map(({ name })=> name);
    if (invalidKeys.includes(key)) return 'error';
    return null;
  }

  render() {
    const assigneeOptions = this
      .state
      .employees
      .filter(({ _id })=> _id !== this.state.task.approver)
      .map(({ _id, name })=> ({ label: name, value: _id }));

    const approverOptions = this
      .state
      .employees
      .filter(({ _id })=> _id !== this.state.task.assignee)
      .map(({ _id, name })=> ({ label: name, value: _id }));

    const statusOptions = [
        'Idea',
        'Planned',
        'In Progress',
        'Complete',
        'Blocked',
      ]
      .map((item)=> ({ label: item, value: item }));

    return (
      <form onSubmit={this.openModal}>
        <FormGroup>
          <FormControl
            type='text'
            value={this.state.task.name}
            placeholder='Enter task name'
            onChange={(event) => this.changeState(this.state.task, 'name', event.target.value)}
          />
        </FormGroup>
        <Modal show={this.state.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              <div onClick={()=> this.changeState(this.state, 'editName', true)}>
                {
                  (this.state.editName) ? (
                    <div>
                      <i className='fa fa-credit-card'/>&nbsp;
                      <input
                        type='text'
                        autoFocus
                        value={this.state.task.name}
                        onChange={(event) => this.changeState(this.state.task, 'name', event.target.value)}
                        onBlur={()=> this.changeState(this.state, 'editName', false)}
                      />
                    </div>
                  ) : (
                    <div>
                      <i className='fa fa-credit-card'> { this.state.task.name }</i>
                    </div>
                  )
                }
              </div>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <FormGroup validationState={this.getValidationState('description')}>
                <ControlLabel>Description</ControlLabel>
                {
                  (this.state.editDescription) ? (
                    <FormControl
                      componentClass='textarea'
                      placeholder='description'
                      autoFocus
                      value={this.state.task.description}
                      onChange={(event)=> this.changeState(this.state.task, 'description', event.target.value)}
                      onBlur={()=> this.changeState(this.state, 'editDescription', false)}
                    />
                  ) : (
                    <div>
                      <a
                        className='form-control task-description'
                        onClick={()=> this.changeState(this.state, 'editDescription', true)}
                      >
                        Edit the description
                      </a>
                      <p style={{ paddingLeft: '12px', whiteSpace: 'pre-wrap' }}>{ this.state.task.description }</p>
                      <HelpBlock>{ this.state.context.keyErrorMessage('description') }</HelpBlock>
                    </div>
                  )
                }
              </FormGroup>
              <FormGroup validationState={this.getValidationState('assignee')}>
                <ControlLabel>Assignee</ControlLabel>
                <Select
                  options={assigneeOptions}
                  onChange={({ label, value })=> this.changeState(this.state.task, 'assignee', value)}
                  value={this.state.task.assignee}
                  clearable={false}
                />
                <HelpBlock>{ this.state.context.keyErrorMessage('assignee') }</HelpBlock>
              </FormGroup>
              <FormGroup validationState={this.getValidationState('approver')}>
                <ControlLabel>Approver</ControlLabel>
                <Select
                  options={approverOptions}
                  onChange={({ label, value })=> this.changeState(this.state.task, 'approver', value)}
                  value={this.state.task.approver}
                  clearable={false}
                />
                <HelpBlock>{ this.state.context.keyErrorMessage('approver') }</HelpBlock>
              </FormGroup>
              <FormGroup validationState={this.getValidationState('dueDate')}>
                <ControlLabel>Due Date</ControlLabel>
                <div className='form-control'>
                  <DatePicker
                    selected={moment(this.state.task.dueDate)}
                    minDate={moment()}
                    onChange={(date)=> this.changeState(this.state.task, 'dueDate', date.toDate())}
                  />
                </div>
                <HelpBlock>{ this.state.context.keyErrorMessage('dueDate') }</HelpBlock>
              </FormGroup>
              <FormGroup validationState={this.getValidationState('status')}>
                <ControlLabel>Status</ControlLabel>
                <Select
                  options={statusOptions}
                  value={this.state.task.status}
                  onChange={({ label, value })=> this.changeState(this.state.task, 'status', value)}
                  clearable={false}
                />
                <HelpBlock>{ this.state.context.keyErrorMessage('status') }</HelpBlock>
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.addTask}>Save</Button>
          </Modal.Footer>
        </Modal>
      </form>
    );
  }
}
export default createContainer(({ projectId })=> {
  const subscribers = [];
  return {
    subscribers,
  };
}, TasksView);

