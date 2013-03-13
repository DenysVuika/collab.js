collab.js
=========

collab.js is a starter kit for modern, extensible and social-enabled web applications created with node.js, express and jade.

sponsored by  [Raythos Interactive](http://raythos.com/)

[![Raythos Interactive](public/images/raythos.png)](http://raythos.com)

## Table of Contents

- [Features](#major-features)
- [Supported Databases](#supported-databases)
- [Supported Environments](#supported-environments)
- [First Run](#first-run)
  * [Configuring](#configuring)
  * [Installing SQL driver for node.js](#installing-microsof-driver-for-nodejs-for-sql-server-optional-windows-only)
  * [Running](#running)
- [Configuration](#configuration)
  * [Creating custom configurations](#creating-custom-configurations)
      - [Running on OSX](#running-on-osx)
      - [Running on Windows](#running-on-windows)

## Major features

- Account registration with [reCaptcha](http://www.google.com/recaptcha) support
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

## Supported databases

- Microsoft SQL Server 2008/2012 (full or express edition)
- MySQL Server

Database schemas can be found at **```data/schema```** folder.

## Supported environments

collab.js was developed and tested with **OSX Lion 10.7 x64** and **Windows 7 x64**. Project folder contains all configuration files required to open it with [WebMatrix 2](http://www.microsoft.com/web/webmatrix/). It is possible deploying and running collab.js on both Linux and [Windows](http://goo.gl/Pn44P)-based servers.

## First run

#### Configuring

* Setup database with one of the scripts from 'data/schema' folder.
* Install all dependencies with NPM:

  ```npm install``` for Windows or ```sudo npm install``` for OSX

* Open 'config/config.default.js' and edit the following section:

```javascript
// data
config.data.provider = 'collabjs.data.mysql';
config.data.host = '.';
config.data.database = 'collabjs';
config.data.user = '<user>';
config.data.password = '<password>';
```
The value of ```config.data.provider``` parameter can be either ```collabjs.data.mssql``` for MS SQL provider or ```collabjs.data.mysql``` for MySQL provider support.

Host name for ```config.data.host``` parameter can take values like ```.``` (default MS SQL SERVER instance) or ```localhost```, IP address like ```192.168.1.1``` or ```127.0.0.1```.

#### Installing Microsof Driver for node.js for SQL Server (optional, Windows only)

In case of using MS SQL Server an additional npm package needs to be installed:

```sudo npm install msnodesql``` for OSX or ```npm install msnodesql``` for Windows

This package is available for Windows systems only, so it is not included into default configuration.

#### Running

That's it, you can now run the server:

```node server.js```

## Configuration

It is possible (and recommended) having multiple configurations for running and testing collab.js. 
Default configuration layer consists of the following files:

* ```index.js``` - default entry point
* ```config.global.js``` - global application settings
* ```config.default.js``` - custom application settings

Common configuration loading workflow is as follows: 

1. ```index.js``` checks ```NODE_CFG``` environment variable to determine whether custom configuration file should be loaded, and takes ```config.default.js``` as a fallback resource
2. ```config.default.js``` inherits ```config.global.js``` structure and overrides global settings with custom values (if any)

Out-of-box implementation of [config.default.js](config/config.default.js) may look similar to the following:

```javascript
var config = require('./config.global');

// TODO: override global settings here

// configure data provider
config.data.provider = 'collabjs.data.mysql';
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

* create a file named ```config.debug.js``` and put it into the **/config** folder
* open the file with your favorite text editor and override some global settings, for example enabling invitation code for registration form

```javascript
var config = require('./config.global');
// enable invitation
config.invitation.enabled = true;
config.invitation.code = '12345';
// export settings
module.exports = config;
```

* assign a ```NODE_CFG``` environment varible with ```debug``` value (name of your configuration file without 'config.' prefix
and '.js' extension.

####Running on OSX

It is possible exporting environment variables right from the command line like shown below:

```NODE_CFG=debug node server.js```

####Running on Windows

If you are using [WebStorm](http://www.jetbrains.com/webstorm/) for node.js development on Windows then you can edit your project settings to define 
```NODE_CFG=debug``` environment variable so that every time you run/debug your project the custom configuration
file is used.
