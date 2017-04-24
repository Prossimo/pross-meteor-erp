import React, { Component, PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import moment from 'moment';
import FindUser from './FindUser.jsx';

class TaskDetail extends Component {
  constructor() {
    super();
    this.state = {
      findUser: {
        assignee: false,
        approver: false,
      },
      selectedUser: {
        assignee: null,
        approver: null,
      },
    };
    this.toggleFindUser = this.toggleFindUser.bind(this);
  }

  toggleFindUser(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  render() {
    const TaskControl = styled.button `
      width: 125px;
    `;
    const HeaderContainer = styled.div `
      position: relative;
    `;
    const TitleContent = styled.div `
      position: relative;
      margin-left: 25px;
    `;
    const TitleIcon = styled.div `
      position: absolute;
      width: 30px;
    `;
    const TextArea = styled.textarea `
      font-size: 14px;
      margin-top: 15px;
      margin-left: 15px;
      width: 100%;
      min-height: 100px;
      border-image: none;
      border-radius: 6px 6px 6px 6px;
      border-style: none none none solid;
      border-width: medium 1px 1px medium;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12) inset;
      color: #555555;
      font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
      font-size: 1em;
      line-height: 1.4em;
      padding: 5px 8px;
      transition: background-color 0.2s ease 0s;
      background: none repeat scroll 0 0 #FFFFFF;
      border-left-color: green;
      &:focus {
        background: none repeat scroll 0 0 rgba(0, 0, 0, 0.07);
        outline-width: 0;
      }
    `;
    const UserElem = styled.div `
      color: white;
      position: relative;
      background-color: #519839;
      height: 38px;
      line-height: 38px;
      padding-left: 10px;
      border-radius: 5px;
      font-weight: 700;
      overflow-x: hidden;
      div {
        position: absolute;
        top: 0px;
        right: 20px;
        background-color: #519839;
        color: white;
        border: 0px;
        outline: none;
        cursor: pointer;
      }
    `;
    const selectedUser = this.state.selectedUser;
    const findUser = this.state.findUser;

    return (
      <Modal
        show={this.props.isShown}
        onHide={this.props.hideDetail}
      >
        <Modal.Body>
          <div className='row'>

            <div className='col-md-9'>
              <HeaderContainer>
                <TitleIcon>
                  <i className='fa fa-credit-card'/>
                </TitleIcon>
                <TitleContent>
                  Convert incoming email to project and attach converstaion
                </TitleContent>
              </HeaderContainer>
              <TextArea
                defaultValue={'This is a sample'}
              />
            </div>

            <div className='col-md-3'>
              <div className='form-group'>
                {
                  (selectedUser.assignee) ? (
                    <UserElem>
                      { selectedUser.assignee.username }
                      <div onClick={ ()=> this.toggleFindUser(selectedUser, 'assignee', null) }>
                        <i className='fa fa-times'/>
                      </div>
                    </UserElem>
                  ) : (
                    <TaskControl
                      className='btn btn-default btn-sm'
                      onClick={()=> this.toggleFindUser(this.state.findUser, 'assignee', !this.state.findUser.assignee)}
                    >
                      <i className='fa fa-user-o'> Assignee</i>
                    </TaskControl>
                  )
                }
                {
                  (findUser.assignee) ? (
                    <FindUser
                      title={'Assignee'}
                      top={'50px'}
                      ignore={selectedUser.approver}
                      selectUser={ (assignee)=> this.toggleFindUser(this.state.selectedUser, 'assignee', assignee) }
                      close={ ()=> this.toggleFindUser(this.state.findUser, 'assignee', false) }/>
                  ) : ''
                }
              </div>
              <div className='form-group'>
                {
                  (selectedUser.approver) ? (
                    <UserElem>
                      { selectedUser.approver.username }
                      <div onClick={()=> this.toggleFindUser(selectedUser, 'approver', null)}>
                        <i className='fa fa-times'/>
                      </div>
                    </UserElem>
                  ) : (
                    <TaskControl
                      className='btn btn-default btn-sm'
                      onClick={()=> this.toggleFindUser(this.state.findUser, 'approver', !this.state.findUser.approver)}
                    >
                      <i className='fa fa-eye'> Approver</i>
                    </TaskControl>
                  )
                }
                {
                  (findUser.approver) ? (
                    <FindUser
                      title={'Approver'}
                      top={'100px'}
                      ignore={selectedUser.assignee}
                      selectUser={ (approver)=> this.toggleFindUser(this.state.selectedUser, 'approver', approver) }
                      close={ ()=> this.toggleFindUser(this.state.findUser, 'approver', false) }/>
                  ) : ''
                }
              </div>
              <div className='form-group'>
                <label style={{fontSize: '14px'}}>Due Date</label>
                <div className='form-control'>
                  <DatePicker
                    selected={moment(new Date())}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-default'>Save</button>
        </Modal.Footer>
      </Modal>
    );
  };
}

TaskDetail.propTypes = {
  showDetail: PropTypes.func.isRequired,
  hideDetail: PropTypes.func.isRequired,
  isShown: PropTypes.bool.isRequired,
};

export default TaskDetail;
