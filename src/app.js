const Discord = require('discord.js');
const request = require('request');
const client = new Discord.Client();

const config = require('../config/settings.json');

const url = `http://mcapi.us/server/status?ip=${config.server_ip}`;

let wasOnline = false;
let initialReady = false;

function updatePresence(activity, status) {
    client.user.setPresence( {
        game: {
            name: activity
        },
        status: status
    }).then( () => console.log(`Presence changed to: ${activity} with status ${status}.`))
    .catch( err => console.error(err));
}

function serverQuery() {
    request(url, (error, response, body) => {
      if (error) console.error(error);
      if (response) console.log(response);
        body = JSON.parse(body);
        if(body.hasOwnProperty('favicon')) {
          updatePresence(`${body.players.now} of ${body.players.max}.`, 'online');
          if(!wasOnline) {
            console.log('Server is now online!');
            const channel = client.channels.find(channel => channel.id === config.channel_id);
            channel.send('@everyone the server is up.').catch(err => console.error(err));
            wasOnline = true;
          }
        } 
        else {
            console.log('Server has gone offline!');
            updatePresence(`Server is offline.`, 'dnd');
            wasOnline = false;
        }
    });
}

client.on('ready', () => {
    console.log('Ready!');
    if (!initialReady) {
        setInterval(serverQuery, 10000);
        initialReady = true;
    }
});

client.on('disconnect', () => {
    console.warn('WebSocket has been disconnected and will no longer attempt to reconnect.');
});

client.on('reconnecting', () => {
    console.warn('Trying to reconnect to the WebSocket...');
});

client.on('resume', () => {
    console.warn('WebSocket connection resumed.');
});

client.on('warn', info => {
    console.warn(info);
});

client.on('error', info => {
    console.error(info);
});

client.login(config.discord_token);