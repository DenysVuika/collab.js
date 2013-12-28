collab.js
=========

collab.js is a starter kit for modern, extensible and social-enabled web applications created with node.js, express and jade.

[![Build Status](https://travis-ci.org/DenisVuyka/collab.js.png?branch=master)](https://travis-ci.org/DenisVuyka/collab.js)
[![Dependency Status](https://gemnasium.com/DenisVuyka/collab.js.png)](https://gemnasium.com/DenisVuyka/collab.js)

sponsored by [Raythos Interactive](http://raythos.com/)

[![Raythos Interactive](public/img/raythos.png)](http://raythos.com)

## Table of Contents

- [Features](#major-features)
- [Running](#running)
- [Configuration](#configuration)
  * [Creating custom configurations](#creating-custom-configurations)
      - [Running on OSX](#running-on-osx)
      - [Running on Windows](#running-on-windows)
- [License](#license)

Please refer to [Wiki](https://github.com/DenisVuyka/collab.js/wiki) for more details and articles.

## Major features

- Account creation
- User account settings and [Gravatar](http://www.gravatar.com) support
- News timeline with user posts (status updates)
- Public user profiles
- Following/Unfollowing users
- Personal feeds and "twitterization" of content (account links, hash tags, etc.)
- Comment system (including separate post view for large amount of comments)
- Mentions system
- People hub, browsing user networks
- Markdown-based help system (with GitHub styling)
- Smooth (infinite) scrolling with chunked data download
- Background checks for new status updates
- RESTful APIs to access everything used by frontend
- Flexible configuration, easy to extend
- Extensible data layer with multiple providers
- Runs everywhere node.js can run

## Running

* Setup database with one of the scripts from 'data/schema/{engine}' folder.
* Install all dependencies with NPM:

  `npm install`

* Open 'config/config.default.js' and edit the following section:

```javascript
// data
config.data.provider = 'collabjs.data.mysql';
config.data.sessionStore = 'collabjs.data.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';
```

Where `<user>` and `<password>` should be replaced with valid credentials.

That's it, you can now run the server:

`node server.js`

## Configuration

It is possible (and recommended) having multiple configurations for running and testing collab.js. 
Default configuration layer consists of the following files:

* `index.js` - default entry point
* `config.global.js` - global application settings
* `config.default.js` - custom application settings

Common configuration loading workflow is as follows: 

1. `index.js` checks `NODE_CFG` environment variable to determine whether custom configuration file should be loaded, and takes ```config.default.js``` as a fallback resource
2. `config.default.js` inherits `config.global.js` structure and overrides global settings with custom values (if any)

Out-of-box implementation of [config.default.js](config/config.default.js) may look similar to the following:

```javascript
var config = require('./config.global');

// TODO: override global settings here

// configure data provider
config.data.provider = 'collabjs.data.mysql';
config.data.sessionStore = 'collabjs.session.mysql';
config.data.host = 'localhost';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';

module.exports = config;
```

*For the full list of available global settings please refer to the contents of [config.global.js](config/config.global.js) file.*

### Creating custom configurations

On practice you may want having multiple different configurations in order to test multiple settings, i.e.
different database connections, local or remote storage, etc. Follow the steps below in order to create a new
configuration file.

* create a file named `config.debug.js` and put it into the **/config** folder
* open the file with your favorite text editor and override some global settings, for example enabling invitation code for registration form

```javascript
var config = require('./config.global');
// enable invitation
config.invitation.enabled = true;
config.invitation.code = '12345';
// export settings
module.exports = config;
```

* assign a `NODE_CFG` environment variable with `debug` value (name of your configuration file without 'config.' prefix
and '.js' extension.

####Running on OSX

It is possible exporting environment variables right from the command line like shown below:

`NODE_CFG=debug node server.js`

####Running on Windows

```bash
set NODE_CFG=debug
node server.js
```

If you are using [WebStorm](http://www.jetbrains.com/webstorm/) for node.js development on Windows then you can edit your project settings to define 
`NODE_CFG=debug` environment variable so that every time you run/debug your project the custom configuration
file is used.

## License

**The MIT License (MIT)**

**Copyright (c) 2013 Denis Vuyka**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
