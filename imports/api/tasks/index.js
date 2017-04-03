import { Tasks } from '../lib/collections';
import './methods';
import './todoist';

function createTodoistProject(name, localProjectId) {
    check(localProjectId, String);
    check(name, String);
    const { id } = Meteor.call('task.newProject', name);
    Tasks.update({ 'project.id': id }, {
        $set: {
            localProjectId,
        }
    });
}

function createTodoistSalesRecord(name, localSalesRecordId) {
    check(localSalesRecordId, String);
    check(name, String);
    const { id } = Meteor.call('task.newProject', name);
    Tasks.update({ 'project.id': id }, {
        $set: {
            localSalesRecordId,
        }
    });
}

export {
    createTodoistProject,
    createTodoistSalesRecord,
};

