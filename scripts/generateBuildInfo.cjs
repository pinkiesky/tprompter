const fs = require('fs');
const { join } = require('path');
const packageJson = require(join(__dirname, '..', 'package.json'));
const childProcess = require('child_process');

async function generateBuildInfo() {
  const buildInfoPath = join(__dirname, '..', 'dist', 'buildInfo.js');

  let content = fs.readFileSync(buildInfoPath, 'utf8');
  content = content.replace('{{VERSION}}', packageJson.version);

  const hash = childProcess.execSync('git rev-parse HEAD').toString().trim();
  content = content.replace('{{GIT_HASH}}', hash);

  fs.writeFileSync(buildInfoPath, content);
  console.log('Written build info to', buildInfoPath);
}

generateBuildInfo();
