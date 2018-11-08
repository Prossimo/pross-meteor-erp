import { DEALS_LIST } from "../constants";
const INITIAL = [];
const deals = (state = INITIAL, action) => {
  switch (action.type) {
    case DEALS_LIST:
      return state;
    default:
      return state;
  }
};
export default deals;
