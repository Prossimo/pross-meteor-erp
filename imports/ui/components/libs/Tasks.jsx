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
    this.closeModal = this.closeModal.bind(this);
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
    };
  }

  changeState(propElem, propKey, propValue) {
    propElem[propKey] = propValue;
    this.setState((prevState)=> prevState);
  }

  addTask(event) {
    event.preventDefault();
    this.openModal();
  }

  closeModal() {
    this.setState({
      showModal: false,
    });
  }

  openModal(event) {
    event && event.preventDefault();
    this.setState({
      showModal: true,
    });
  }

  getValidationState() {
    return null;
  }

  render() {
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
              <FormGroup validationState={this.getValidationState()}>
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
                    </div>
                  )
                }
              </FormGroup>
              <FormGroup>
                <ControlLabel>Assignee</ControlLabel>
                <Select/>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Approver</ControlLabel>
                <Select/>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Due Date</ControlLabel>
                <div className='form-control'>
                  <DatePicker
                    selected={moment(this.state.task.dueDate)}
                    onChange={(date)=> this.changeState(this.state.task, 'dueDate', date.toDate())}
                  />
                </div>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Status</ControlLabel>
                <Select/>
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal}>Close</Button>
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

