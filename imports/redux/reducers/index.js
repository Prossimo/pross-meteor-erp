import { combineReducers } from 'redux'
import deals from './deals'
import projects from './projects'
import dealsParams from './dealsParams'
// import visibilityFilter from './visibilityFilter'

export default combineReducers({
    deals,
    projects,
    dealsParams
    // visibilityFilter
})
