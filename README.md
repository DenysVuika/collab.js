collab.js
=========

collab.js is a starter kit for modern, extensible and social-enabled web applications created with node.js, express and jade.

[![Build Status](https://travis-ci.org/DenisVuyka/collab.js.png?branch=master)](https://travis-ci.org/DenisVuyka/collab.js)

sponsored by  [Raythos Interactive](http://raythos.com/)

[![Raythos Interactive](public/img/raythos.png)](http://raythos.com)

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
- [Deployment](#deployment)
  * [RedHat OpenShift](#redhat-openshift)

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

```
set NODE_CFG=debug
node server.js
```

If you are using [WebStorm](http://www.jetbrains.com/webstorm/) for node.js development on Windows then you can edit your project settings to define 
```NODE_CFG=debug``` environment variable so that every time you run/debug your project the custom configuration
file is used.

## Deployment

This section contains various deployment scenarios and hints.

### RedHat OpenShift

To get more details on running node.js with RedHat's OpenShift PaaS please refer to the articles below:

- [Node.js on OpenShift](https://openshift.redhat.com/community/get-started/node-js)
- [Any version of Node.JS you want in the cloud - OpenShift does it PaaS style](https://openshift.redhat.com/community/blogs/any-version-of-nodejs-you-want-in-the-cloud-openshift-does-it-paas-style)

Deploying collab.js to OpenShift instance is extremely easy. 
It should take just several minutes if you follow the steps below.

* clone collab.js master repository to your local system and navigate to the project folder with your terminal/command prompt
* open ```config/config.default.js``` file with your favourite text editor and uncomment a section called 
*'RedHat OpenShift Configuration (with MySQL cartridge)'*. The content of the section may look like the following:

```javascript
config.env.ipaddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
config.env.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
config.data.provider = 'collabjs.data.mysql';
config.data.host = process.env.OPENSHIFT_MYSQL_DB_HOST;
config.data.database = 'collabjs';
config.data.user = process.env.OPENSHIFT_MYSQL_DB_USERNAME;
config.data.password = process.env.OPENSHIFT_MYSQL_DB_PASSWORD;
```

* decide on the node.js version you want running on server

Edit file '.openshift/markers/NODEJS_VERSION' with your favourite text editor and provide the desired version of the node.js.
The contents may look like the following:

```
#  Uncomment one of the version lines to select the node version to use.
#  The last "non-blank" version line is the one picked up by the code in
#  .openshift/lib/utils
#  Default: 0.8.9
#
# 0.8.9
# 0.9.1
0.8.16
```

* now commit the changes locally

```
git add .
git commit -m "enabled OpenShift configuration"
```

* create a namespace if you haven't done that already

```
rhc domain create YOURNAMESPACE
```

* create a new **collabjs** application with **mysql** and **phpmyadmin** cartridges

```
rhc app create -a collabjs -t nodejs-0.6
rhc cartridge add mysql-5.1 -a collabjs
rhc cartridge add phpmyadmin-3.4 -a collabjs
```

*Notes: after executing the commands above you may see a new 'collabjs' folder appeared at current directory.
This is an initial template for node.js applications generated by rhc tool. 
You won't need it, so feel free to remove this folder.*

* setup database schema

You can access **phpmyadmin** cartridge by navigating to the following link (rhc tool will output it during steps above): 
```https://collabjs-YOURNAMESPACE.rhcloud.com/phpmyadmin/```. MySQL database schema for collab.js is located in the
following file: ```data/schema/mysql/schema.mysql.sql```.

* configure separate git remote for publishing

It is recommended to leave 'master' branch as it is in order to preserve your current GitHub settings.
The easiest way of having both GitHub and OpenShift (or Azure) deployment enabled in parallel is using dedicated remotes for that.

```
git remote add openshift ssh://APPLICATIONID@collabjs-YOURNAMESPACE.rhcloud.com/~/git/collabjs.git/
```

Where **APPLICATIONID** and **YOURNAMESPACE** should be replaced with appropriate values 
(rhc tool should give you correct address during application creation, alternatively you can get the full repository
address in your web management panel).

* publish collab.js

```
git push openshift master --force
```

*Note: for the very first publishing you will need using '--force' switch 
in order to replace default node.js sample pregenerated by rhc tool. You can omit it for later deployments.*

* start using your personal collab.js version

```
https://collabjs-YOURNAMESPACE.rhcloud.com
```
