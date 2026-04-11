// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D


const { InteractionType } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                const { commands } = client;
                const command = commands.get(interaction.commandName);
                if (command) {
                    await command.execute(interaction, client);
                }
            }
        } catch (error) {
            console.error(error);
        }
    },
};

