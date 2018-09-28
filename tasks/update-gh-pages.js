var ghpages = require('gh-pages');
var packageDef = require('../package.json');

var version = packageDef.version;
var repo = packageDef.repository.url;

var message = 'Update resources on gh-pages branch';

// Publish the current version in the versioned directory.
ghpages.publish('build/docs', {
  dest: `${version}`,
  message: message,
  repo: repo,
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
      repo: repo,
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
