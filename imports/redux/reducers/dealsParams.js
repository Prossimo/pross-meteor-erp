import { DEALS } from '/imports/utils/constants'
import {
    DEALS_PARAMS,
    SET_PARAM,
    SET_PARAMS
} from '../constants'

const INITIAL = {
    keyword: '',
    groupBy: DEALS.GROUP_BY.STAGE,
    showArchivedDeals: false,
    columns: ['_id', 'name', 'subStage', 'productionStartDate'],
    sort: {
        key: 'productionStartDate',
        order: DEALS.ORDER.ASC
    },
    kanbanViews: {
        lead: false,
        opportunity: false,
        order: false,
        ticket: false,
    },
    collapsedViews: {}
}

const dealsParams = (state = INITIAL, action) => {
    switch (action.type) {
        case DEALS_PARAMS: {
            return state
        }
        case SET_PARAM: {
            state[action.payload.key] = action.payload.value
            return {
                ...state
            }
        }
        case SET_PARAMS: {
            return {
                ...state,
                ...action.payload
            }
        }
    }
    return state
}

export default dealsParams
