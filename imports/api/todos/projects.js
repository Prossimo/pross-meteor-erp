export default class TodoistProjects {
    constructor() {
        this.commands = [];
    }

    // add a project
    add(name) {
        check(name, String);
        this.commands.push({
            type: 'project_add',
            args: { name },
        });
    }

    // update a project
    update() {
    }

    // remove a project
    remove(ids) {
        check(ids, [String]);
        this.commands.push({
            type: 'project_delete',
            args: { ids }
        });
    }
}

