

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D




const { Events } = require('discord.js');
const roleSet = require('../commands/utility/roleset');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === 'role_select') {
            await roleSet.handleRoleSelect(interaction);
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('role_modal_')) {
            await roleSet.handleModalSubmit(interaction);
        }
    },
};
