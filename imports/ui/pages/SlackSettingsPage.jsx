import React, { Component } from 'react'
import {
  compose,
  withState,
  lifecycle,
  branch,
  renderComponent,
  withHandlers,
} from 'recompose'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import Settings from '/imports/api/models/settings/settings'
import { createContainer } from 'meteor/react-meteor-data'

const SLACK_NOTIFICATION_CHANNEL = 'SLACK_NOTIFICATION_CHANNEL'

class SlackSettingsPage extends Component {
  render() {
    const {
      channels,
      channel,
      saveChannel,
    } = this.props

    return (
      <div className='page-container user-settings'>
        <div className='main-content'>
          <div className='tab-container'>
            <h2 className='page-title'> Slack Channel Page </h2>
            <div className='tab-content'>
              <table className='table table-condensed'>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Notification Channel</td>
                    <td>
                      <Select
                        value={channel}
                        options={channels}
                        onChange={saveChannel}
                        clearable={false}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const SlackPageWithData = compose(
  branch(
    ({ ready }) => !ready,
    renderComponent(() => <p className='text-center'>Loading</p>)
  ),
  withState('channels', 'updateChannels', []),
  withState('channel', 'updateChannel', { label: 'None', value: -1 }),
  lifecycle({
    componentDidMount() {
      const { updateChannels, updateChannel, slackChannel } = this.props
      Meteor.call('getSlackChannels', (error, channels) => {
        if (channels.length) {
          channels = channels.map(({ id, name }) => ({ value: id, label: name }))
          updateChannels(channels)
        }
        if (slackChannel && !!slackChannel.value) {
          const channel = channels.find(({ value }) => slackChannel.value === value)
          updateChannel(channel)
        }
      })
    }
  }),
  withHandlers({
    saveChannel: ({ updateChannel }) => ({ value, label }) => {
      updateChannel({ value, label })
      Meteor.call('settings.update', { key: SLACK_NOTIFICATION_CHANNEL, value })
    }
  })
)(SlackSettingsPage)

export default createContainer(() => {
  const sub = Meteor.subscribe('settings.all')
  const settings = Settings.find({ key: SLACK_NOTIFICATION_CHANNEL }).fetch()
  return {
    ready: sub.ready(),
    slackChannel: _.first(settings),
  }
}, SlackPageWithData)
