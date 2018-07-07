import _ from 'underscore'
import React, {PropTypes} from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {NylasUtils, Actions, DraftsStore} from '/imports/api/nylas'
import ItemDraft from './ItemDraft'

const LIMIT = 100
export default class DraftList extends TrackerReact(React.Component) {
    static propTypes = {
        category: PropTypes.object,
        onSelectDraft: PropTypes.func
    }

    constructor(props) {
        super(props)
        this.page = 1
    }

    onSelectDraft = (draft) => {
        if (this.props.onSelectDraft) this.props.onSelectDraft(draft)
        DraftsStore.selectDraft(draft)
    }

    render() {
        const { drafts, category, currentDraft } = this.props
        if (!category) return <div>Please select drafts folder</div>
        const uniqDrafts = _.uniq(drafts, false, ({id}) => id)
        return (
            <div className="column-panel" style={{
                overflowY: 'auto',
                height: '100%'
            }} onScroll={this.onScrollDraftList}>
                <div className="list-thread">
                {
                    uniqDrafts.map((draft, index) => <ItemDraft key={`draft-${index}`} draft={draft}
                    onClick={(evt) => this.onSelectDraft(draft)}
                    selected={currentDraft && draft.id == currentDraft.id}/>)

                }
                </div>
            </div>
        )
    }

    onScrollDraftList = (evt) => {
        const el = evt.target

        if (el.scrollTop + el.clientHeight == el.scrollHeight
          && !DraftsStore.fullyLoaded) {
            this.page += 1
            Actions.loadDrafts(null, {page: DraftsStore.currentPage + 1})
        }
    }
}
