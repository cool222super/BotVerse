// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { Events } = require('discord.js');
const { removeTicket, removeAllTickets } = require('../commands/utility/ticketremove.js');
const { userDataCache } = require('./profilebutton.js');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith('remove_ticket_')) return;

        try {
            await interaction.deferUpdate();

            const userId = interaction.customId.split('_')[2];
            const selected = interaction.values[0];

            let success = false;
            let message = '';

            if (selected === 'all') {
                success = await removeAllTickets(userId, interaction);
                message = success
                    ? 'All tickets have been removed.'
                    : 'Couldn’t remove all tickets, try again later.';
            } else {
                const index = Number(selected);

                success = await removeTicket(userId, index, interaction);
                message = success
                    ? `Ticket ${index + 1} removed successfully.`
                    : 'Couldn’t remove that ticket, try again.';
            }
            await new Promise(r => setTimeout(r, 3000));

            if (success && userDataCache?.tickets) {
                userDataCache.tickets.delete(userId);
            }

            await interaction.editReply({
                content: message,
                embeds: [],
                components: []
            });

        } catch (err) {
            console.error('Error handling ticket removal menu:', err);

            if (!interaction.replied) {
                await interaction.editReply({
                    content: 'An error occurred while processing this request.',
                    embeds: [],
                    components: []
                });
            }
        }
    },
};
