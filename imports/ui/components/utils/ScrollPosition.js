import React from "react";
import { connect } from "react-redux";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";

class ScrollPosition extends React.Component {
  constructor(props) {
    super(props);

    this.scrollPositionRef = React.createRef();
  }

  componentDidMount() {
    const scrollTop = this.props.scrollTop;
    console.log(" current mount scrollTop", scrollTop);
    this.scrollPositionRef.current.scrollTop = scrollTop;
  }

  componentWillUnmount() {
    const scrollTop = this.scrollPositionRef.current.scrollTop;
    console.log(" current unmount scrollTop", scrollTop);
    store.dispatch(setParam("scrollTop", scrollTop));
  }

  render() {
    return <div ref={this.scrollPositionRef} />;
  }
}
const mapStateToProps = state => {
  const scrollTop = state.scrollTop ? state.scrollTop : 100;
  return { scrollTop };
};

export default connect(mapStateToProps)(ScrollPosition);
