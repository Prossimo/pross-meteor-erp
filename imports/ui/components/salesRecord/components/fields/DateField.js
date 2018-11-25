import React, { Component } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";

export default class DateField extends Component {
  state = {
    value: moment(new Date(this.props.record[this.props.colDetails.key]))
  };

  handleChange = date => {
    const { handleChange } = this.props;
    const value = moment(date).toDate();
    this.setState({ value: date });
    handleChange(value);
  };

  render() {
    const { value } = this.state;
    return <DatePicker selected={value} onChange={this.handleChange} />;
  }
}
