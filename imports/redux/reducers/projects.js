import {
    ACTIVE_TASK
} from '../constants'
const INITIAL = {
    activeTask: null
}
const projects = (state = INITIAL, action) => {
    switch (action.type) {
        case ACTIVE_TASK:
            {
                return {
                    ...state,
                    ...action.payload
                }
            }
        default:
            return state
    }
}
export default projects
