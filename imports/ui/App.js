import { Meteor } from "meteor/meteor";
import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import Alert from "react-s-alert";
import BlockUi from "react-block-ui";
import { Loader, Types } from "react-loaders";
import { Provider } from "react-redux";
import "loaders.css/loaders.min.css";
import "react-block-ui/style.css";
import Header from "./components/header/Header";
// import Aside from './components/aside/Aside'
import Spinner from "./components/utils/spinner";
import { SalesRecords } from "/imports/api/models";
import store from "/imports/redux/store";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      blocking: false
    };
  }
  // renderAside = () => {
  //     const { currentUser, salesRecords } = this.props
  //     if(!currentUser) return null

  //     return <Aside key="main-control-aside"
  //         salesRecords={this.props.salesRecords}
  //         currentUser={currentUser}
  //     />

  // }

  toggleLoader = blocking => {
    //disable scroller
    if (blocking === true) {
      $(".app").attr("style", "overflow: hidden");
    } else {
      $(".app").attr("style", "overflow: scroll");
    }
    this.setState({ blocking });
  };

  render() {
    const { loading, currentUser } = this.props;
    if (loading) return <Spinner visible={true} />;

    return (
      <Provider store={store}>
        <BlockUi
          className="app"
          tag="div"
          loader={
            <Loader active type="line-spin-fade-loader" color="#5b8bff" />
          }
          blocking={this.state.blocking}
        >
          <Header user={currentUser} />
          {/* this.renderAside() */}
          <div className="page-content">
            {React.cloneElement(this.props.content, {
              ...this.props,
              toggleLoader: this.toggleLoader
            })}
          </div>
          <Alert stack={{ limit: 3 }} />
        </BlockUi>
      </Provider>
    );
  }
}

export default withTracker(() => {
  const subscribers = [];
  subscribers.push(Meteor.subscribe("users.all"));
  subscribers.push(Meteor.subscribe("nylasaccounts.all"));
  subscribers.push(Meteor.subscribe("contacts.mine"));
  subscribers.push(Meteor.subscribe("mailtemplates.all"));
  subscribers.push(Meteor.subscribe("companies.all"));
  subscribers.push(Meteor.subscribe("companytypes.all"));
  subscribers.push(Meteor.subscribe("conversations.all"));
  subscribers.push(Meteor.subscribe("people.all"));
  subscribers.push(Meteor.subscribe("peopledesignations.all"));
  subscribers.push(Meteor.subscribe("salesrecords.mine"));
  subscribers.push(Meteor.subscribe("projects.mine"));
  subscribers.push(Meteor.subscribe("clientstatuses.all"));
  subscribers.push(Meteor.subscribe("supplierstatuses.all"));

  const currentUser = Meteor.users.findOne(Meteor.userId());

  const salesRecords = SalesRecords.find(
    {},
    { sort: { createAt: -1 } }
  ).fetch();
  const users = Meteor.users
    .find(
      {},
      {
        sort: [["profile.firstName", "asc"]]
      }
    )
    .fetch();
  const usersArr = {};
  users.forEach(item => {
    usersArr[item._id] = item;
  });

  return {
    loading: !subscribers.reduce(
      (prev, subscriber) => prev && subscriber.ready(),
      true
    ),
    currentUser,
    users,
    usersArr,
    salesRecords
  };
})(App);
