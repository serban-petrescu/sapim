# sapim
> SAP API Manager Tools

A suite of tools for deploying and building SAP API Manager API proxies and key-value maps. Check out the [wiki](https://github.com/serban-petrescu/sapim/wiki) for more information.

## Install
### Via npm

```sh
# If you just want to use the command line interface:
npm install sapim -g

# If you want to use the package during development or build-time:
npm install sapim --save-dev

# If you want to use the API during runtime:
npm install sapim --save
```
### Binary download
For using the library purely as a command line tool, a binary version (for x64 OS) can be downloaded from the [releases](https://github.com/serban-petrescu/sapim/releases) section. This binary exexcutable does not depend on the presence of NodeJS or NPM on your system.

## Usage
### Manifests
The package uses YAML or JSON-based manifests for describing the API Manager artifacts. These manifest must adhere to the schema described by `manifest.schema.json`.

```yml
proxy:
  name: my-test-proxy
  path: ./my-test-proxy
  templated: true
  placeholders:
    some-placeholder-name: My string value here
    another-placeholder: Another string value here
maps:
  my-first-map-name:
    some-string-key: Some string value
```
### Command-line interface
To use the commands that imply communicating with the API Manager, you need to provide a user, password and host for the library to use. You have two options for specifying them:

 - Using the environment variables `SAPIM_USERNAME`, `SAPIM_PASSWORD` and `SAPIM_HOST`.
 - Using a [.sapim](https://github.com/serban-petrescu/sapim/wiki/Configuration#using-a-sapim-file) file.

For more details, check out the [configuration](https://github.com/serban-petrescu/sapim/wiki/Configuration) wiki page.

The following commands are available:
 - build commands
   - [package manifest](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#package)
   - [package all](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#package-all-manifests)
   - [package proxy](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#package-proxy)
 - deployment commands
   - [deploy manifest](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#deploy-manifest)
   - [deploy all](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#deploy-all-manifests)
   - [deploy proxy](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#deploy-proxy)
 - template commands
   - [apply template](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#apply-template)
   - [extract template (manifest)](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#extract-template-from-manifest)
   - [extract template (proxy)](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#extract-template-from-files)
 - misc commands
   - [upload proxy](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#upload-proxy)
   - [download proxy](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#download-proxy)
   - [configure](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#configure)
   - [get proxy url](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#get-proxy-url)
   - [get manifest url](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#get-manifest-url)
   - [get virtual host info](https://github.com/serban-petrescu/sapim/wiki/Command-Line-Interface#get-virtual-host-info)

### Programmatic usage
All the above commands have a corresponding method exposed as part of the library's public API. You can read more about using it [in the corresponding wiki page](https://github.com/serban-petrescu/sapim/wiki/Programmatic-Usage) and you can find the reference documentation [on GitHub Pages](https://serban-petrescu.github.io/sapim/sapim/0.0.6/).

Example usage:
```js
    var sapim = require("sapim").default();
    sapim.deployManifest("/path/to/my/manifest.yaml")
      .then(function() {
         console.log("Success!");
      });
```
## License
SAP API Management Tools under copyright (c) 2018-present Serban Petrescu <Serban.Petrescu@outlook.com>

This library is free software, licensed under the Apache License, Version 2.0. See the file `LICENSE` in this distribution for more details.
