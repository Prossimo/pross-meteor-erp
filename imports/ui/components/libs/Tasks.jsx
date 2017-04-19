import React, { Component } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Modal,
  Button,
  Table,
  Tooltip,
  OverlayTrigger,
  Checkbox,
} from 'react-bootstrap';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import className from 'classnames';
import { createContainer } from 'meteor/react-meteor-data';
import { Tasks } from '/imports/api/lib/collections';

const dateSort = new ReactiveVar(1);
const assignToMeFilter = new ReactiveVar(false);
const taskNameFilter = new ReactiveVar('');
class TasksView extends Component {
  constructor(props) {
    super(props);
    this.getValidationState = this.getValidationState.bind(this);
    this.changeState = this.changeState.bind(this);
    this.addTask = this.addTask.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderTasks = this.renderTasks.bind(this);
    this.getEmployeeName = this.getEmployeeName.bind(this);
    this.getEmployeeFullName = this.getEmployeeFullName.bind(this);
    this.editTask = this.editTask.bind(this);
    this.sortDate = this.sortDate.bind(this);
    this.assignToMe = this.assignToMe.bind(this);
    this.state = {
      task: {
        _id: '',
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
      _id: {
        type: String,
        optional: true,
      },
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

  componentWillUnmout() {
    this.props.subscribers.forEach((subscribe)=> subscriber.stop());
    dateSort.set(1);
    assignToMeFilter.set(false);
    taskNameFilter.set('');
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
    if (propKey === 'name') taskNameFilter.set(propValue);
  }

  addTask() {
    const task = this.state.taskSchema.clean(this.state.task);
    const parentId = FlowRouter.current().params.id;
    this.state.context.validate(task);
    if (!this.state.context.invalidKeys().length) {
      this.setState({
        showModal: false,
      });

      // add task to server
      task.parentId = parentId;
      if (task._id)
        Meteor.call('task.update', task);
      else
        Meteor.call('task.create', task);
      this.setState({
        task: {
          name: '',
          dueDate: new Date(),
          description: '',
          assignee: '',
          approver: '',
        },
      });
      taskNameFilter.set('');
    } else {
      this.setState((prevState)=> prevState);
    }
  }

  openModal(event) {
    event && event.preventDefault();
    if (this.state.task.name) {
      this.setState({
        showModal: true,
      });
    }
  }

  closeModal() {
    this.setState({
      showModal: false,
      task: {
        _id: '',
        name: '',
        dueDate: new Date(),
        description: '',
        assignee: '',
        approver: '',
      },
    });
    taskNameFilter.set('');
  }

  getValidationState(key) {
    const invalidKeys = this.state.context.invalidKeys().map(({ name })=> name);
    if (invalidKeys.includes(key)) return 'error';
    return null;
  }

  getEmployeeFullName(userId) {
    const employee = this
      .state
      .employees
      .find(({ _id, name })=> userId === _id);
    if (employee) return employee.name;
  }

  getEmployeeName(userId) {
    const employee = this
      .state
      .employees
      .find(({ _id, name })=> userId === _id);
    if (employee) return employee.name.split(' ').reduce((r, n)=> r + n.charAt(0), '');
  }

  editTask(task, event) {
    event.preventDefault();
    this.state.task = _.clone(task);
    this.openModal();
  }

  statusIcon(status) {
    const targetTooltip = (msg)=> (
      <Tooltip id='tooltip'>
        { msg }
      </Tooltip>
    );
    switch (status) {
      case 'Idea':
        return (
          <OverlayTrigger placement='left' overlay={targetTooltip('Task is an idea')}>
            <i className='fa fa-lightbulb-o'/>
          </OverlayTrigger>
        );
      case 'Planned':
        return (
          <OverlayTrigger placement='left' overlay={targetTooltip('Task is planned')}>
            <i className='fa fa-tasks'/>
          </OverlayTrigger>
        );
      case 'In Progress':
        return (
          <OverlayTrigger placement='left' overlay={targetTooltip('Task is in progress')}>
            <i className='fa fa-play'/>
          </OverlayTrigger>
        );
      case 'Complete':
        return (
          <OverlayTrigger placement='left' overlay={targetTooltip('Task is complete')}>
            <i className='fa fa-check-square-o'/>
          </OverlayTrigger>
        );
      case 'Blocked':
        return (
          <OverlayTrigger placement='left' overlay={targetTooltip('Task is blocked')}>
            <i className='fa fa-ban'/>
          </OverlayTrigger>
        );
    }
  }

  renderTasks() {
    const targetTooltip = (msg, target)=> (
      <Tooltip id='tooltip'>
        { msg }
        {
          (target) ? (
            <strong>@{ this.getEmployeeFullName(target) }</strong>
          ) : ''
        }
      </Tooltip>
    );

    return this.props.tasks.map((task)=> {
      const { _id, name, assignee, approver, dueDate, status } = task;
      let style = {};
      if (status == 'Blocked') style = {
        backgroundColor: 'red',
        color: 'white',
      };
      return (
        <tr key={_id} style={style}>
          <td>
            <a href='#' className='task-name' onClick={(event)=> this.editTask(task, event)} style={style}>
              { name }
            </a>
          </td>
          <td style={{ width: '150px' }}>
            {
              (status) ? (
                <span>
                  { this.statusIcon(status) }
                </span>
              ) : ''
            }
          </td>
          <td style={{ width: '150px' }}>
            {
              (approver) ? (
                <span>
                  <span className='fa fa-check-circle-o'/>
                  &nbsp;
                  <OverlayTrigger placement='left' overlay={targetTooltip('Approver is ', approver)}>
                    <span className='edit-link'>
                      { this.getEmployeeName(approver) }
                    </span>
                  </OverlayTrigger>
                  &nbsp;
                </span>
              ) : ''
            }
          </td>
          <td style={{ width: '150px' }}>
            {
              (assignee) ? (
                <span>
                  <span className='fa fa-user-o'/>
                  &nbsp;
                  <OverlayTrigger placement='left' overlay={targetTooltip('Assigned to ', assignee)}>
                    <span className='edit-link'>
                      { this.getEmployeeName(assignee) }
                    </span>
                  </OverlayTrigger>
                  &nbsp;
                </span>
              ) : ''
            }
          </td>
          <td style={{ width: '150px' }}>
            {
              (dueDate) ? (
                <span>
                  <span className='fa fa-calendar-check-o'/>
                  &nbsp;
                  <OverlayTrigger placement='left' overlay={targetTooltip('Due date')}>
                    <span className='edit-link'>
                      { moment(dueDate).format('YYYY/MM/DD') }
                    </span>
                  </OverlayTrigger>
                  &nbsp;
                </span>
              ) : ''
            }
          </td>
        </tr>
      );
    });
  }

  sortDate() {
    if (dateSort.get() === 1) {
      dateSort.set(-1);
    } else {
      dateSort.set(1);
    }
  }

  assignToMe() {
    assignToMeFilter.set(!assignToMeFilter.get());
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
            placeholder='Enter task name / search'
            style={{ borderRadius: '0px' }}
            onChange={(event) => this.changeState(this.state.task, 'name', event.target.value)}
          />
        </FormGroup>
        <Table responsive>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th>
                <Checkbox checked={assignToMeFilter.get()} onChange={this.assignToMe}>
                  Assigned to me
                </Checkbox>
              </th>
              <th>
                <Button onClick={this.sortDate}>
                  {
                    (dateSort.get() === 1) ? (
                      <i className='fa fa-sort-numeric-asc'/>
                    ) : (
                      <i className='fa fa-sort-numeric-desc'/>
                    )
                  }
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            { this.renderTasks() }
          </tbody>
        </Table>
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
  const parentId = FlowRouter.current().params.id;
  const filter = {};
  let tasks = [];
  subscribers.push(Meteor.subscribe('task.all', { parentId }));
  if (assignToMeFilter.get()) {
    filter.assignee = Meteor.userId();
  };

  filter.name = { $regex: new RegExp(taskNameFilter.get()) };
  tasks = Tasks.find(filter, { sort: { dueDate: dateSort.get() } }).fetch();
  return {
    subscribers,
    loading: subscribers.reduce((result, sub)=> result && sub.ready(), true),
    tasks,
  };
}, TasksView);

