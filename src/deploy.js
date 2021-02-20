const shell = require('shelljs');

const pageCommands = [
  `git -C ${config.page_dir} pull`,
  `yarn --cwd ${config.page_dir}`,
  `yarn --cwd ${config.page_dir} build`,
];

const apiCommands = [
  `git -C ${config.api_dir} pull`,
  `yarn --cwd ${config.api_dir}`,
  'pm2 restart api',
];

const deploy = (payload, cb) => {
  const { repository: repo, head_commit: commit } = payload;
  console.log(`Deploying ${repo.name}, commit: ${commit.id}`);
  const commands = repo.name === 'api' ? apiCommands : pageCommands;
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

module.exports = deploy;
