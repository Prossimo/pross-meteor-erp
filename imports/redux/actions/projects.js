import {
    ACTIVE_TASK
} from '../constants'

export function activeTask(taskId) {
    return {
        type: ACTIVE_TASK,
        payload: {
            activeTask: taskId
        }
    }
}
