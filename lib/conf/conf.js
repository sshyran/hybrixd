// conf.js -> handles loading of configuration
//
// (c)2018 internet of coins project - Rouke Pouw
//

// export every function
exports.init = init;
exports.reload = reload;
exports.get = getConf;
exports.set = setConf;
exports.import = importConf;
exports.defaults = defaults;
exports.list = listConf;

const functions = require('../functions');
const fs = require('fs');
const events = require('events');

let metaconf = {};
let conf = {};

function getConf (keys) {
  if (typeof keys === 'string') { keys = keys.split('.'); }
  let c = conf;
  let m = metaconf;
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i].toLowerCase();
    if (m.hasOwnProperty(key)) {
      m = m[key];
    } else {
      console.log(' [!] unknown configuration key: ' + keys.join('.'));
      return undefined;
    }

    if (c && c.hasOwnProperty(key)) {
      c = c[key];
    } else if (i === keys.length - 1) {
      c = m.default;
    }
  }
  return c;
}

function listConf (keys) {
  if (typeof keys === 'undefined') { return metaconf; }
  if (typeof keys === 'string') { keys = keys.split('.'); }
  let c = conf;
  let m = metaconf;
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i].toLowerCase();
    if (m.hasOwnProperty(key)) {
      m = m[key];
    } else {
      console.log(' [!] unknown configuration key: ' + keys.join('.'));
      return undefined;
    }

    if (c && c.hasOwnProperty(key)) {
      c = c[key];
    } else if (i === keys.length - 1) {
      c = m.default;
    }
  }
  return m;
}

function setConf (keys, value) {
  if (typeof keys === 'string') { keys = keys.split('.'); }
  let c = conf;
  let m = metaconf;
  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i].toLowerCase();
    if (m.hasOwnProperty(key)) {
      m = m[key];
    } else {
      console.log(' [!] unknown configuration key: ' + keys.join('.'));
      return undefined;
    }

    if (i === keys.length - 1) {
      const changed = c[key] === value;
      c[key] = value;
      return changed;
    } else if (c.hasOwnProperty(key)) {
      c = c[key];
    } else {
      c[key] = {};
      c = c[key];
    }
  }
  return false;
}

function importConf (fileName, optional) {
  if (fs.existsSync(fileName)) {
    const lines = fs.readFileSync(fileName, 'utf-8').split('\n');
    let stanza = '';
    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i].trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        stanza = line.substring(1, line.length - 1) + '.';
      } else if (!line.startsWith('#') && line.indexOf('=') !== -1) {
        const keyValue = line.split('=');
        setConf(stanza + keyValue[0].trim(), JSON.parse(keyValue[1].trim()));
      }
    }
  } else if (!optional) {
    console.log(' [!] configuration file not found: ' + fileName);
  }
}

function defaults () {
  metaconf = JSON.parse(fs.readFileSync('./conf/metaconf.json', 'utf-8'));

  importConf('../hybrixd.conf');
  importConf('../hybrixd.local.conf', true);
}

function init (callbackArray) {
  defaults();

  // ignore TLS certificate errors?
  if (getConf('host.ignoreTLSerror')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  // load route tree from file
  global.hybrixd.routetree = JSON.parse(fs.readFileSync('./router/routetree.json', 'utf8')); // iterate through routes.json
  Object.keys(global.hybrixd.engine).forEach(id => {
    if (global.hybrixd.engine[id].hasOwnProperty('router')) { // load router data for engines
      global.hybrixd.routetree.engine[id] = global.hybrixd.engine[id].router;
    }
  });

  Object.keys(global.hybrixd.source).forEach(id => {
    if (global.hybrixd.source[id].hasOwnProperty('router')) { // load router data for sources
      global.hybrixd.routetree.source[id] = global.hybrixd.source[id].router;
    }
  });

  events.EventEmitter.defaultMaxListeners = getConf('host.defaultMaxListeners');

  // "hostname" => ["hostname"]   ,  "[hostname1,hostname2]" =>  ["hostname1","hostname2"]
  global.hybrixd.hostname = getConf('host.hostname');

  // load default quartz functions
  global.hybrixd.defaultQuartz = JSON.parse(fs.readFileSync('../modules/quartz/default.quartz.json', 'utf8'));
  functions.sequential(callbackArray);
}

function reload (callbackArray) {
  // TODO clear current conf and reset everything to default
  init(callbackArray);
  // Todo: if conf for ui/rest ports changes we need to reload those as well
}