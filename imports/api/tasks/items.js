import uuidV1 from 'uuid/v1';

export default class TodoistItems {

    constructor() {
        this._commands = [];
    }

    add(content, projectId) {
        check(content, String);
        check(projectId, Number);

        this._commands.push({
            type: 'item_add',
            temp_id: uuidV1(),
            uuid: uuidV1(),
            args: {
                content,
                project_id: projectId,
            }
        })
    }

    update() {

    }

    remove(ids) {
        check(ids, [Number]);

        this._commands.push({
            type: 'item_delete',
            uuid: uuidV1(),
            args: {
                ids,
            }
        });
    }

    complete(ids) {
        check(ids, [Number]);

        this._commands.push({
            type: 'item_complete',
            uuid: uuidV1(),
            args: {
                ids,
            }
        });
    }

    uncomplete(ids) {
        check(ids, [Number]);

        this._commands.push({
            type: 'item_uncomplete',
            uuid: uuidV1(),
            args: {
                ids,
            }
        });
    }

    reset() {
        this._commands = [];
    }
}
