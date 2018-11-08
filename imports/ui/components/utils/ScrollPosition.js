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
    const { scrollTop } = this.props;
    this.scrollPositionRef.current.parentElement.scrollTop = scrollTop;
  }

  componentWillUnmount() {
    const scrollTop = this.scrollPositionRef.current.parentElement.scrollTop;
    store.dispatch(setParam("scrollTop", scrollTop));
  }

  render() {
    return <div ref={this.scrollPositionRef} />;
  }
}
const mapStateToProps = ({ dealsParams }) => ({ 
  scrollTop: dealsParams.scrollTop || 0 
});

export default connect(mapStateToProps)(ScrollPosition);
