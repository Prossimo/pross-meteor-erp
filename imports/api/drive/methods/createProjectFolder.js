import SimpleSchema from 'simpl-schema';
import createFolder from './createFolder';
import listFiles from './listFiles';
import copyFiles from './copyFiles';
import { Projects } from '../../models';
import { prossDocDrive } from '../../config/config';

const { projectParentFolderId }  = prossDocDrive;

export default new ValidatedMethod({
  name: 'drive.createProjectFolder',
  validate: new SimpleSchema({
    name: { type: String },
    projectId: { type: String },
  }).validator(),
  run({ name, projectId }) {
    const projectName = `##### ${name}`;
    const taskName = `Tasks`;
    const { id: folderId } =  createFolder.call({ name: projectName, parent: projectParentFolderId });
    const { id: taskFolderId } = createFolder.call({ name:  taskName, parent: folderId });
    Projects.update(projectId, {
      $set: {
        folderId,
        taskFolderId,
      },
    });
  },
});
