import React, { Component } from 'react';

export default class Sample extends Component {
  componentWillUnmount() {
    console.log('UNMOUT');
  }
  render() {
    return (
      <div></div>
    );
  }
}
