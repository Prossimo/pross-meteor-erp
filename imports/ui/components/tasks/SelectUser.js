import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import FindUser from "./FindUser";
import _ from "lodash";
class SelectUser extends Component {
  constructor() {
    super();
  }

  shortenName(_id) {
    const {
      profile: { firstName, lastName }
    } = Meteor.users.findOne({ _id });
    return `${firstName} ${lastName}`
      .split(" ")
      .reduce((result, next) => `${result}${next.charAt(0)}`, "");
  }

  render() {
    let SelectUserButton = null;
    const TaskControl = styled.button`
      width: 125px;
    `;
    const UserElem = styled.div`
      flex-wrap: nowrap;
      display: flex;
      position: relative;
      line-height: 38px;
      padding-left: 10px;
      border-radius: 5px;
      font-weight: 700;
      overflow: hidden;
      div {
        position: relative;

        top: 0px;
        border: 0px;
        outline: none;
        cursor: pointer;
      }
      p {
        width: 73px;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 0;
      }
    `;
    const SelectedAssignee = styled(UserElem)`
      background-color: #519839;
      color: white;
      div {
        background-color: #519839;
        color: white;
      }
    `;
    const SelectedApprover = styled(UserElem)`
      background-color: #cecece;
    `;

    switch (this.props.title) {
      case "Assignee":
        SelectUserButton = SelectedAssignee;
        break;
      case "Followers":
        SelectUserButton = SelectedApprover;
        break;
    }

    return (
      <div className="form-group">
        {!_.isEmpty(this.props.user) ? (
          <SelectUserButton>
            {/* <p>{this.shortenName(this.props.user)}</p>
            <div onClick={this.props.removeUser}>
              <i className="fa fa-times" /> */}

            <div style={{ width: "95px", display: "inline-block" }}>
              {this.props.user.map(user => (
                <div key={user} style={{ float: "left" }}>
                  {this.shortenName(user)}
                  <i
                    onClick={() => this.props.removeUser(user)}
                    className="fa fa-times"
                  />
                </div>
              ))}
            </div>

            {this.props.name == "approver" ? (
              <div onClick={this.props.toggleFinding}>+</div>
            ) : (
              ""
            )}
          </SelectUserButton>
        ) : (
          <TaskControl
            className="btn btn-default btn-sm"
            onClick={this.props.toggleFinding}
          >
            <i className="fa fa-user-o"> {this.props.title}</i>
          </TaskControl>
        )}
        {this.props.isFinding ? (
          <FindUser
            title={this.props.title}
            top={`${this.props.top}px`}
            ignore={this.props.ignoreUser}
            selectUser={this.props.onSelectUser}
            close={this.props.closeFinding}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

SelectUser.propTypes = {
  isFinding: PropTypes.bool.isRequired,
  closeFinding: PropTypes.func.isRequired,
  ignoreUser: PropTypes.array,
  title: PropTypes.string.isRequired,
  top: PropTypes.number.isRequired,
  user: PropTypes.array,
  onSelectUser: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  toggleFinding: PropTypes.func.isRequired
};

export default SelectUser;
