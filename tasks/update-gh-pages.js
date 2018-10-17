/*eslint-env node*/
/*eslint-disable no-console */

const ghpages = require('gh-pages');
const url = require('url');

const packageDef = require('../package.json');

const version = packageDef.version;
const repoUrl = packageDef.repository.url;
const parsedRepoUrl = url.parse(repoUrl);
const httpsRepoUrl = `https://${parsedRepoUrl.host}${parsedRepoUrl.path}`;

const message = 'Update resources on gh-pages branch';

// Publish the current version in the versioned directory.
ghpages.publish('build/docs', {
  dest: `${version}`,
  message: message,
  repo: httpsRepoUrl,
  add: true
}, function(err) {
  if (err) {
    console.log(`Error while deploying docs to gh-pages (versioned): ${err.message}`);
  } else {
    console.log(`Successfully deployed docs to gh-pages (versioned)!`);

    // Publish the current version in the 'latest' directory.
    ghpages.publish('build/docs', {
      dest: `latest`,
      message: message,
      repo: httpsRepoUrl,
      add: false
    }, function(err) {
      if (err) {
        console.log(`Error while deploying docs to gh-pages (latest): ${err.message}`);
      } else {
        console.log(`Successfully deployed docs to gh-pages (latest)!`);
      }
    });
  }
});
