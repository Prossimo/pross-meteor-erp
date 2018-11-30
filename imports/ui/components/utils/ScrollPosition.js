import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";

class ScrollPosition extends React.Component {
  componentDidMount() {
    const { scrollTop, children } = this.props;
    if (!children.length) {
      ReactDOM.findDOMNode(this).scrollTop = scrollTop;
    } else {
      throw Error("ScrollPosition component can have only one child!");
    }
  }

  componentWillUnmount() {
    const scrollTop = ReactDOM.findDOMNode(this).scrollTop;
    store.dispatch(setParam(`scrollTop${this.props.elementPath}`, scrollTop));
  }

  render() {
    return <>{this.props.children}</>;
  }
}
const mapStateToProps = ({ dealsParams }) => ({
  scrollTop: dealsParams[`scrollTop${window.location.pathname}`] || 0
});

export default connect(mapStateToProps)(ScrollPosition);
