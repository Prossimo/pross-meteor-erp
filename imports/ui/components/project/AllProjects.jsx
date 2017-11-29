/* global FlowRouter, subsManager */
import React, { Component } from 'react'
import { createContainer  } from 'meteor/react-meteor-data'
import Projects from '/imports/api/models/projects/projects'
import Sheets from '/imports/ui/components/libs/Sheets'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

class AllProjects extends Component {
    constructor(props) {
        super(props)
        this.possibleColumns = [
            {
                key: '_id',
                label: 'ID',
                type: 'text',
                selected: false,
                editable: false,
            }, {
                key: 'name',
                label: 'Name',
                type: 'text',
                selected: false,
                editable: true,
            }, {
                key: 'nylasAccountId',
                label: 'Inbox',
                value: (project) => {
                    const nylasAccount = project.nylasAccount()
                    if(!nylasAccount) return ''
                    else return nylasAccount.emailAddress
                },
                type: 'text',
                selected: false,
                editable: false,
            }
        ]
        this.saveProjectProperty = this.saveProjectProperty.bind(this)
        this.removeProject = this.removeProject.bind(this)
    }

    componentWillUnmount() {

    }

    saveProjectProperty(projectId, { key, value }, callback) {
        const project = Projects.findOne(projectId)
        project[key] = value
        Meteor.call('project.update', project, (err, res) => {
            if(err) {
                err.reason = `Problems with updating project. ${err.error}`
                callback && callback(err)
                return
            }
            callback && callback(null, 'Success update project attributes')
        })
    }

    removeProject({ _id }) {
      swal({
        title: 'Are you sure ?',
        type: 'warning',
        html: `
          <div class='form-group text-left'>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-folders'/> Remove resource folders
              </label>
            </div>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-slack'/> Remove slack channel
              </label>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
        preConfirm: () => new Promise((resolve) => {
            resolve({
              isRemoveFolders: $('#confirm-remove-folders').is(':checked'),
              isRemoveSlack: $('#confirm-remove-slack').is(':checked'),
            })
          }),
      }).then(({ isRemoveFolders, isRemoveSlack }) => {
          Meteor.call('project.remove',{ _id, isRemoveFolders, isRemoveSlack }, (err,res) => {
              if(err) {
                  const msg = err.reason ? err.reason : err.message
                  return swal('remove project failed',  msg, 'warning')
              }
              swal(
                  'Removed!',
                  'Project has been removed.',
                  'success'
              )
          })
      })
    }
    archiveProject({ _id }) {
      swal({
        title: 'Are you sure to archive this project?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!'
      }).then(() => {
          Meteor.call('archiveProject', _id, true, (err,res) => {
              if(err) {
                  const msg = err.reason ? err.reason : err.message
                  return swal('archiving project failed',  msg, 'warning')
              }
              swal(
                  'Archive!',
                  'Project has been archived.',
                  'success'
              )
          })
      })
    }
    activeProject({ _id }) {
        Meteor.call('archiveProject', _id, false, (err,res) => {
            if(err) {
                const msg = err.reason ? err.reason : err.message
                return swal('activating project failed',  msg, 'warning')
            }
            swal(
                'Active!',
                'Project has been actived again.',
                'success'
            )
        })
    }

    goTo(project) {
        FlowRouter.go('Project', {id: project._id})
    }

    render() {
        const {keyword} = this.props
        let {projects} = this.props
        if(keyword && keyword.length > 0) {
            projects = projects.filter((p) => p.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
        }
        return (
            <div style={{height:'100%'}}>
            {
                (this.props.loading) ? (
                    <div>Loading ...</div>
                ) : (
                    <Sheets
                        rows={projects}
                        columns={this.possibleColumns}
                        onSave={this.saveProjectProperty}
                        settingKey={'newProject'}
                        goTo={this.goTo}
                        remove={this.removeProject}
                        archive={this.archiveProject}
                        active={this.activeProject}
                    />
                )
            }
            </div>
        )
    }
}

export default createContainer(() => {
    const subscribers = []
    subscribers.push(subsCache.subscribe('projects.mine'))
    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
        projects: Projects.find({},{sort:{createdAt:-1}}).fetch(),
    }
}, AllProjects)
