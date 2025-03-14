import React, { Component } from "react";
import PropTypes from "prop-types";

class FindUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    };

    this.changeState = this.changeState.bind(this);
    this.selectUser = this.selectUser.bind(this);
    this.changeKeyword = _.throttle(keyword => {
      const ignore = props.ignore ? props.ignore : [];
      Meteor.call("task.findUsers", { keyword, ignore }, (error, users) => {
        if (!error) this.setState({ users });
      });
    }, 2000);
  }

  componentDidMount() {
    this.changeKeyword("");
  }

  changeState(prop, propName, propValue) {
    prop[propName] = propValue;
    this.setState(prevState => prevState);
  }

  selectUser(user) {
    this.props.selectUser(user._id);
    this.props.close();
  }

  render() {
    return (
      <div className="find-user-wrapper" style={{ top: `${this.props.top}px` }}>
        <a
          onClick={this.props.close}
          className="pull-right find-user-close-button"
          href="#"
        >
          <i className="fa fa-times" />
        </a>
        <p className="text-center">{this.props.title}</p>
        <div>
          <div className="form-group">
            <input
              type="text"
              className="form-control input-sm"
              placeholder={`Search ${this.props.title}s`}
              ref="keyword"
              onChange={event => this.changeKeyword(event.target.value)}
              autoFocus={true}
            />
          </div>
          <div className="form-group">
            {this.state.users.map(user => {
              const { username, emails, _id } = user;
              const email = _.first(emails)
                ? `(${_.first(emails).address})`
                : "";
              return (
                <div
                  className="assignee-elem"
                  key={_id}
                  onClick={() => this.selectUser(user)}
                >
                  {username} {email}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

FindUser.propTypes = {
  close: PropTypes.func.isRequired,
  selectUser: PropTypes.func.isRequired,
  top: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  ignore: PropTypes.array
};

export default FindUser;
