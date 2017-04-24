import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';

class FindUser extends Component {
  constructor() {
    super();
  }

  render() {
    const FindUserWrapper = styled.div `
      width: 240px;
      min-height: 150px;
      background-color: white;
      position: fixed;
      padding: 5px;
      font-size: 13px;
      top: ${this.props.top};
      box-shadow: 0 1px 6px rgba(0,0,0,.15);
    `;
    const Header = styled.p `
      font-weight: 600;
      border-bottom: 1px solid lightgrey;
    `;
    const InputSearch = styled.input `
      border-radius: 0px;
    `;
    const CloseButton = styled.a `
      color: black;
    `;
    const AssigneeElem = styled.div `
      background-color: #298FCA;
      padding: 3px;
      border-radius: 3px;
      color: white;
      cursor: pointer;
      margin-bottom: 3px;
    `;
    return (
      <FindUserWrapper>
        <CloseButton
          onClick={ this.props.close }
          className='pull-right'
          href='#'>
          <i className='fa fa-times'/>
        </CloseButton>
        <Header className='text-center'>Assignees</Header>
        <div>
          <div className='form-group'>
            <InputSearch
              type='text'
              className='form-control input-sm'
              placeholder='Search Assignees'
            />
          </div>
          <div className='form-group'>
            <AssigneeElem>
              Duy Tai Nguyen (duytai.cse@gmail.com)
            </AssigneeElem>
            <AssigneeElem>
              Duy Tai Nguyen (duytai.cse@gmail.com)
            </AssigneeElem>
          </div>
        </div>
      </FindUserWrapper>
    );
  };
}

FindUser.propTypes = {
  close: PropTypes.func.isRequired,
  top: PropTypes.string.isRequired,
};

export default FindUser;
