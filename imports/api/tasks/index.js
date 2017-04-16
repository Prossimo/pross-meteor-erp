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

function createTodoistDeal(name, localDealId) {
    check(localDealId, String);
    check(name, String);
    const { id } = Meteor.call('task.newProject', name);
    Tasks.update({ 'project.id': id }, {
        $set: {
            localDealId,
        }
    });
}

export {
    createTodoistProject,
    createTodoistDeal,
};

