import React from "react";
import PropTypes from "prop-types";
import { FlowRouter } from "meteor/kadira:flow-router";
import styled from "styled-components";
import moment from "moment";
import {
  DEAL_PRIORITY,
  DEAL_PROBABILITY
} from "/imports/api/models/salesRecords/salesRecords";
import { SHIPPING_MODE_LIST, STATES } from "/imports/api/constants/project";
import {
  Users,
  ClientStatus,
  SupplierStatus,
  People
} from "/imports/api/models";
import {
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET,
  STAGES_MAP
} from "/imports/api/constants/project";

const getSubStages = stage => {
  switch (stage) {
    case "lead":
      return SUB_STAGES_LEAD;
    case "opportunity":
      return SUB_STAGES_OPP;
    case "order":
      return SUB_STAGES_ORDER;
    case "ticket":
      return SUB_STAGE_TICKET;
    default:
      return [];
  }
};

const goToProject = id => {
  FlowRouter.go("Deal", { id });
};

const LinkDiv = styled.a`
  display: block;
  color: #3379b7;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: #202e54;
  }
`;

const dateRenderer = value => {
  let formatted = null;
  try {
    const momentDate = moment(new Date(value));
    formatted = momentDate.isValid() ? momentDate.format("MM/DD/YYYY") : "";
  } catch (e) {
    formatted = value;
  }
  return formatted;
};

const selectRenderer = value => {
  return value.value || value;
};

export const _id = {
  key: "_id",
  label: "ID",
  type: "text",
  selected: false,
  editable: false
};

export const name = {
  key: "name",
  label: "Name",
  type: "text",
  selected: false,
  editable: true,
  renderer: ({ _id, name }) => {
    return <LinkDiv onClick={() => goToProject(_id)}> {name} </LinkDiv>;
  }
};

export const dealer = {
  key: "dealer",
  label: "  Dealer  ",
  selected: false,
  options: () =>
    People.find()
      .fetch()
      .filter(p => {
        const designation = p.designation();
        return designation && designation.name === "Dealer";
      })
      .map(p => ({ value: p._id, label: p.name })),
  type: "select",
  editable: true,
  renderer: record => {
    const dealer = record.getDealer();
    return dealer ? dealer.name : null;
  }
};

export const productionStartDate = {
  key: "productionStartDate",
  label: "Start Date",
  selected: false,
  type: "date",
  editable: false,
  renderer(record) {
    return dateRenderer(record.productionStartDate);
  }
};

export const actualDeliveryDate = {
  key: "actualDeliveryDate",
  label: "Delivery Date",
  selected: false,
  type: "date",
  editable: true,
  renderer(record) {
    return dateRenderer(record.actualDeliveryDate);
  }
};

export const shippingContactEmail = {
  key: "shippingContactEmail",
  label: "Shipping Email",
  selected: false,
  type: "text",
  editable: true
};

export const shippingAddress = {
  key: "shippingAddress",
  label: "Shipping Address",
  selected: false,
  type: "text",
  editable: true
};

export const shippingContactPhone = {
  key: "shippingContactPhone",
  label: "Shipping Phone",
  selected: false,
  type: "text",
  editable: true
};

export const shippingNotes = {
  key: "shippingNotes",
  label: "Shipping Notes",
  selected: false,
  type: "text",
  editable: true
};

export const billingContactName = {
  key: "billingContactName",
  label: "Billing Contact",
  selected: false,
  type: "text",
  editable: true
};

export const billingContactEmail = {
  key: "billingContactEmail",
  label: "Billing Email",
  selected: false,
  type: "text",
  editable: true
};

export const billingAddress = {
  key: "billingAddress",
  label: "Billing Address",
  selected: false,
  type: "text",
  editable: true
};

export const billingContactPhone = {
  key: "billingContactPhone",
  label: "Billing Phone",
  selected: false,
  type: "text",
  editable: true
};

export const billingNotes = {
  key: "billingNotes",
  label: "Billing Notes",
  selected: false,
  type: "text",
  editable: true
};

export const shippingMode = {
  key: "shippingMode",
  label: "Shipping Mode",
  selected: false,
  type: "select",
  options: SHIPPING_MODE_LIST.map(value => ({ label: value, value })),
  editable: true,
  rendered(record) {
    return selectRenderer(record.shippingMode);
  }
};

export const supplier = {
  key: "supplier",
  label: "Supplier",
  selected: false,
  type: "text",
  editable: true
};

export const shipper = {
  key: "shipper",
  label: "Shipper",
  selected: false,
  type: "text",
  editable: true
};

export const shippingContactName = {
  key: "shippingContactName",
  label: "Shipping Name",
  selected: false,
  type: "text",
  editable: true
};

export const stage = {
  key: "stage",
  label: "Stage",
  selected: false,
  options: STAGES_MAP,
  type: "select",
  editable: true,
  rendered(record) {
    return selectRenderer(record.stage);
  }
};

export const subStage = {
  key: "subStage",
  label: "Sub Stage",
  selected: false,
  options: ({ stage }) => getSubStages(stage),
  type: "select",
  editable: true,
  rendered(record) {
    return selectRenderer(record.subStage);
  }
};

export const teamLead = {
  key: "teamLead",
  label: "Team Lead",
  selected: false,
  options: record => {
    return record.getMembers().map(m => ({ value: m._id, label: m.name() }));
  },
  type: "select",
  editable: true,
  renderer: record => {
    const user = Users.findOne(record.teamLead);
    return user ? user.name() : null;
  }
};

export const bidDueDate = {
  key: "bidDueDate",
  label: "Bid Due Date",
  selected: false,
  type: "date",
  editable: true,
  renderer(record) {
    return dateRenderer(record.bidDueDate);
  }
};

export const priority = {
  key: "priority",
  label: "Priority",
  selected: false,
  options: Object.values(DEAL_PRIORITY).map(v => ({ value: v, label: v })),
  type: "select",
  editable: true,
  rendered(record) {
    return selectRenderer(record.priority);
  }
};

export const expectedRevenue = {
  key: "expectedRevenue",
  label: "Expected Revenue",
  selected: false,
  options: [],
  type: "currency",
  editable: true,
  renderer: record => {
    if (!record.expectedRevenue) return "";
    return `$ ${parseFloat(record.expectedRevenue).toLocaleString("en-US", {
      minimunFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
};

export const totalSquareFootage = {
  key: "totalSquareFootage",
  label: "Total Square Footage",
  selected: false,
  options: [],
  type: "number",
  editable: true,
  renderer: record => {
    if (!record.totalSquareFootage) return "";
    return `${parseFloat(record.totalSquareFootage)}`;
  }
};

export const probability = {
  key: "probability",
  label: "Probability",
  selected: false,
  options: Object.values(DEAL_PROBABILITY).map(v => ({ value: v, label: v })),
  type: "select",
  editable: true,
  rendered(record) {
    return selectRenderer(record.probability);
  }
};

export const clientStatus = {
  key: "clientStatus",
  label: "Client Status",
  selected: false,
  options: () => {
    const statuses = ClientStatus.find().fetch();
    return statuses.map(v => ({ value: v._id, label: v.name }));
  },
  type: "selectWithAdd",
  editable: true,
  renderer: ({ clientStatus }) => {
    const status = ClientStatus.findOne(clientStatus);
    return status ? status.name : null;
  }
};

export const supplierStatus = {
  key: "supplierStatus",
  label: "Supplier Status",
  selected: false,
  options: () => {
    const statuses = SupplierStatus.find().fetch();
    return statuses.map(v => ({ value: v._id, label: v.name }));
  },
  type: "selectWithAdd",
  editable: true,
  renderer: ({ supplierStatus }) => {
    const status = SupplierStatus.findOne(supplierStatus);
    return status ? status.name : null;
  }
};

export const dealState = {
  key: "dealState",
  label: "Deal State",
  selected: false,
  options: Object.values(STATES).map(state => ({
    label: `${state.countryCode}/${state.state}`,
    value: state.stateCode
  })),
  type: "select",
  editable: true,
  renderer: record => {
    const state = _.findWhere(STATES, { stateCode: record.dealState });
    return state ? `${state.countryCode}/${state.state}` : null;
  }
};
