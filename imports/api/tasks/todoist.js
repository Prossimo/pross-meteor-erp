import { request } from 'meteor/froatsnook:request';
import TodoistProjects from './projects';
import TodoistItems from './items';

const TODOIST_API_ENDPOINT = 'https://todoist.com/API/v7/sync';

class TodoistAPI {
    constructor(token) {
        check(token, String);
        this._syncToken = '*';
        this._token = token;
        this.projects = new TodoistProjects();
        this.items = new TodoistItems();
    }

    commit() {
        const commands = _.union(
            this.projects._commands,
            this.items._commands,
        );
        this.projects.reset();
        this.items.reset();

        const { response: { statusCode }, body } = request.postSync(TODOIST_API_ENDPOINT, {
            form: {
                token: this._token,
                commands: JSON.stringify(commands),
            }
        });
        if (statusCode === 200) {
            return JSON.parse(body);
        } else {
            throw new Meteor.Error('commit data to todoist with error: ' + body);
        }
    }

    sync(types) {
        types = types || ['all'];
        check(types, [String]);
        const { response : { statusCode }, body } = request.postSync(TODOIST_API_ENDPOINT, {
            form: {
                token: this._token,
                sync_token: this._syncToken,
                resource_types: JSON.stringify(types),
            }
        });
        if (statusCode === 200) {
            const result = JSON.parse(body);
            this._syncToken = result.sync_token;
            return result;
        } else {
            throw new Meteor.Error('Fetch data from todoist with error: ' + body);
        }
    }
}

export default {
    TodoistAPI(token) {
        check(token, String);
        return new TodoistAPI(token)
    }
}

