import { request } from 'meteor/froatsnook:request';
import TodoistProjects from './projects';

const TODOIST_API_ENDPOINT = 'https://todoist.com/API/v7/sync';

class TodoistAPI {
    constructor(token) {
        check(token, String);
        this._token = token;
        this.projects = new TodoistProjects();
    }

    commit() {

    }

    sync(types) {
        types = types || ['all'];
        check(types, [String]);
        const { response : { statusCode }, body } = request.postSync(TODOIST_API_ENDPOINT, {
            form: {
                token: this._token,
                sync_token: '*',
                resource_types: JSON.stringify(types),
            }
        });
        if (statusCode === 200) {
            return JSON.parse(body);
        } else {
            throw new Meteor.Err('Fetch data from todoist with error: ' + body);
        }
    }
}

export default {
    TodoistAPI(token) {
        check(token, String);
        return new TodoistAPI(token)
    }
}

