import React, { Component } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";
import * as columnsDetails from "./columnsDetails";
import { DEALS } from "/imports/utils/constants";

const ActiveThInner = styled.div`
  transition: color 0.2s ease;
  padding: 8px;
  width: 100%;
  color: #2e2e2e;

  position: fixed;
  border-bottom: 2px solid #dddddd;
  margin-left: -10px;
  background-color: #fff;
  z-index: 10;
  margin-top: -30px;
`;

const ActiveTh = styled.th`
    cursor: pointer;
    padding: 0;
    min-height: 30px;
    }
    &:hover {
        color: #202e54;
    }
    .fa {
        margin-left: 5px;
    }
`;

class SalesRecordsTableHeader extends Component {
  state = {
    topOffset: 60
  };

  componentDidMount() {
    const navbarHeight = $("nav.navbar-default").height();
    this.setState({ topOffset: navbarHeight });
  }

  handleSort = event => {
    const { sort } = this.props;
    const key = event.currentTarget.dataset.key;
    if (key !== DEALS.GROUP_BY.SUBSTAGE) {
      store.dispatch(
        setParam("sort", {
          key,
          order: key == sort.key ? -1 * sort.order : 1
        })
      );
    }
  };

  render() {
    const { columns, sort, fixedHeader } = this.props;
    const { topOffset } = this.state;

    return (
      <thead>
        <tr>
          {columns.map((col, idx) => {
            return (
              <ActiveTh
                key={idx}
                {...{ "data-key": col }}
                onClick={this.handleSort}
              >
                <ActiveThInner fixedHeader={fixedHeader} topOffset={topOffset}>
                  {columnsDetails[col].label}
                  {col === sort.key && col !== DEALS.GROUP_BY.SUBSTAGE ? (
                    <i
                      className={`fa fa-caret-${
                        sort.order > 0 ? "up" : "down"
                      }`}
                    />
                  ) : null}
                </ActiveThInner>
              </ActiveTh>
            );
          })}
          <ActiveTh />
        </tr>
      </thead>
    );
  }
}

const mapStateToProps = ({ dealsParams: { columns, sort } }) => {
  return {
    columns,
    sort
  };
};

export default connect(mapStateToProps)(SalesRecordsTableHeader);
