collab.js
=========

collab.js is a starter kit for modern, extensible and social-enabled web applications created with node.js, express and jade.

sponsored by  [Raythos Interactive](http://raythos.com/)

[![Raythos Interactive](public/images/raythos.png)](http://raythos.com)

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

- Microsoft SQL Server 2012 (full or express edition)
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

*Default invitation code for registration form is ```123123123```, you can change it later on within ```config/config.global.js``` file.*
