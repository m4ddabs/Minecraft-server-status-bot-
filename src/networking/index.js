const request = require('request');
const config = require('../../config/settings.json');

const url = `http://mcapi.us/server/status?ip=${config.server_ip}`;

function serverQuery(callback) {
  request(url, (error, response, body) => {
    if (error) {
      console.error(error)
    }
    callback(JSON.parse(body));
  });
}

module.exports = serverQuery;
