const shell = require('shelljs');
const { validateJsonWebhook } = require('./utils');

const repoCommands = {
  api: [
    `git -C ${config.api_dir} pull`,
    `yarn --cwd ${config.api_dir}`,
    'pm2 restart api',
  ],
  eSantini: [
    `git -C ${config.page_dir} pull`,
    `yarn --cwd ${config.page_dir}`,
    `yarn --cwd ${config.page_dir} build`,
  ],
  wedding: [`git -C ${config.wedding_dir} pull`],
};

const deploy = (payload, cb) => {
  const { repository: repo, head_commit: commit } = payload;
  console.log(`Deploying ${repo.name}, commit: ${commit?.id}`);
  const commands = repoCommands[repo.name];
  for (const command of commands) {
    shell.echo(`Running Deploy command: "${command}"`);
    const { code } = shell.exec(command);
    if (code !== 0) {
      const errMsg = `Error Deploying ${repo.name}. Command: "${command}". Error code: ${code}`;
      shell.echo(errMsg);
      return cb(errMsg);
    } else {
      shell.echo(`Deploy command Success: "${command}"`);
    }
  }
  cb();
};

module.exports = app =>
  app.post('/api/git-push', (req, res) => {
    let error = validateJsonWebhook(req) ? null : 'Invalid Request';
    if (error) {
      console.warn(error);
      return res.sendStatus(401);
    } else res.sendStatus(200);

    deploy(req.body, (err) => (error = err));
    if (error) console.warn(error);
  });
