import uuidV1 from 'uuid/v1';

export default class TodoistProjects {
    constructor() {
        this._commands = [];
    }

    // add a project
    add(name) {
        check(name, String);
        this._commands.push({
            type: 'project_add',
            uuid: uuidV1(),
            temp_id: uuidV1(),
            args: { name },
        });
    }

    // update a project
    update() {
    }

    // remove a project
    remove(ids) {
        check(ids, [String]);
        this._commands.push({
            type: 'project_delete',
            uuid: uuidV1(),
            temp_id: uuidV1(),
            args: { ids }
        });
    }

    reset() {
        this._commands = [];
    }
}

