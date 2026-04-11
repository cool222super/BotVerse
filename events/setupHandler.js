// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D


const { Events } = require('discord.js');
const setupCommand = require('../commands/utility/setup');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        try {
            const isSetupSelect =
                interaction.isStringSelectMenu() &&
                interaction.customId === 'setup_select';

            const isSetupModal =
                interaction.isModalSubmit() &&
                interaction.customId.startsWith('setup_modal_');

            if (!isSetupSelect && !isSetupModal) return;
            if (!interaction.isRepliable()) return;

            if (isSetupSelect) {
                try {
                    await setupCommand.handleSetupSelect(interaction);
                } catch (err) {
                    if (err?.code === 10062) return;
                    if (err?.code === 10064) return;
                    console.log('There was an error in the setup select:', err);
                }
            }

            if (isSetupModal) {
                try {
                    await setupCommand.handleModalSubmit(interaction);
                } catch (err) {
                    if (err?.code === 10062) return;
                    if (err?.code === 10064) return;
                    console.log('There was an error in the setup modal:', err);
                }
            }

        } catch (err) {
            console.log('The setup handler has crashed:', err);

            if (interaction.isRepliable() && !interaction.replied) {
                try {
                    await interaction.reply({
                        content: 'An error occurred while processing this interaction.',
                        ephemeral: true,
                    });
                } catch {}
            }
        }
    },
};
