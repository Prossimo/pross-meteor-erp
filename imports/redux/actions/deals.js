import {
    DEALS_PARAMS,
    SET_PARAM,
    SET_PARAMS
} from '../constants'

export function dealsParams() {
    return {
        type: DEALS_PARAMS
    }
}

export function setParam(key, value) {
    return {
        type: SET_PARAM,
        payload: {
            key,
            value
        }
    }
}

export function setParams(params) {
    return {
        type: SET_PARAMS,
        payload: params
    }
}