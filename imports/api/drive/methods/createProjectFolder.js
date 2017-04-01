import SimpleSchema from 'simpl-schema';
import createFolder from './createFolder';
import { Projects } from '../../lib/collections';
import { prossDocDrive } from '../../config/config';

const { projectParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
    name: 'drive.createProjectFolder',
    validate: new SimpleSchema({
        name: { type: String },
        projectId: { type: String },
    }).validator(),
    run({ name, projectId }) {
        const projectName = `00[##### ${name}]`;
        const { id } =  createFolder.call({ name: projectName, parent: projectParentFolderId });
        Projects.update(projectId, { $set: { folderId: id } });
    },
})
