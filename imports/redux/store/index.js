import {
    applyMiddleware,
    createStore
} from 'redux'
import thunk from 'redux-thunk'
import promise from 'redux-promise'
import { createLogger } from 'redux-logger'
import reducers from '../reducers'

const logger = Meteor.isDevelopment ? createLogger() : null
const store = createStore(
    reducers,
    applyMiddleware(thunk, promise, logger)
)

export default store
