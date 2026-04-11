// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user?.username} is online! (${client.user?.id})`);

        const updateStatus = () => {
            const serverCount = client.guilds.cache.size;
            
            client.user.setPresence({
                activities: [{ 
                    name: `over ${serverCount} servers`, 
                    type: ActivityType.Watching 
                }],
                status: 'online',
            });
        };

        updateStatus();

        const rotationInterval = 10 * 1000; 
        setInterval(() => {
            updateStatus();
        }, rotationInterval);
    },
};
