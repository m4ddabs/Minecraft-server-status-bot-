const Discord = require('discord.js');
const config = require('../config/settings.json');
const serverQuery = require('./networking/index.js');

const client = new Discord.Client();

let initialReady = false;

let serverWasOffline = true;
let lastPlayers = null;

function updatePresence(activity, status) {
    client.user.setPresence( {
        game: {
            name: activity
        },
        status: status
    }).then( () => console.log(`Presence changed to: ${activity} with status ${status}.`))
    .catch( err => console.error(err));
}

function handleServerResponse(response) {
    if (response.online) {
        if (serverWasOffline) {
            console.log(`Server ${config.server_ip} is now online!`);
            
            const broadcastChannel = client.channels.find(channel => channel.id === config.channel_id);
            broadcastChannel
                .send(`${broadcastChannel.guild.defaultRole}, the server is now online! You can join it from: **${config.server_ip}**`)
                .catch(err => console.error(err));

            serverWasOffline = false;

            if (lastPlayers !== response.players.now) {
                lastPlayers = response.players.now;
                updatePresence(`${response.players.now} of ${response.players.max}`, 'online');
            }
        }
    }
    else {
        if (serverWasOffline) {
            return;
        }

        console.log(`Server ${config.server_ip} has gone offline!`);
        updatePresence('Server is offline');
        serverWasOffline = true;
    }
}

client.on('ready', () => {
    console.log('Ready!');
    serverQuery( res => handleServerResponse(res));
    if (!initialReady) {
        setInterval(() => serverQuery( res => handleServerResponse(res)), 5*1000);
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