import { Tasks } from '../lib/collections';
import todoist from './todoist';
const TODOIST_API_TOKEN = 'a3a2b024924e20e10b79865db7fe6a70a4c603e4';
const api = todoist.TodoistAPI(TODOIST_API_TOKEN);

Meteor.methods({
    // sync local project with server projects
    'task.syncProjects'() {
        const { projects } = api.sync(['projects']);
        projects.forEach((project)=> {
            const task = Tasks.findOne({ 'project.id': project.id });
            if (task) {
                Tasks.update( task._id,{ $set: { project } });
            } else {
                Tasks.insert({ project });
            }
        });
        return projects;
    },
    // sync local items with server item
    'task.syncItems'() {
        const { items } = api.sync(['items']);
        items.forEach((item)=> {
            const task = Tasks.findOne({ 'project.id': item.project_id, items: { $elemMatch: { id: item.id } }});
            if (task) {
                Tasks.update({ _id: task._id, items: { $elemMatch: { id: item.id } } }, {$set: { 'items.$' :  item}});
            } else {
                Tasks.update({ 'project.id': item.project_id }, { $push: { items: item }});
            }
        });
        return items;
    },
    // add new project
    'task.newProject'(name) {
        check(name, String)
        api.projects.add(name);
        api.commit();
        const projects = Meteor.call('task.syncProjects');
        return _.last(projects);
    },
    // add new items
    'task.newItem'(content, projectId) {
        check(content, String);
        check(projectId, Number);
        api.items.add(content, projectId);
        api.commit();
        const items = Meteor.call('task.syncItems');
        return _.last(items);
    },
    'task.complete'(id) {
        check(id, Number);
        api.items.complete([id]);
        api.commit();
        const items = Meteor.call('task.syncItems');
        return _.last(items);
    }
})
