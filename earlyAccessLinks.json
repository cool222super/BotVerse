


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { Events } = require('discord.js');
const { removeTicket, removeAllTickets } = require('../commands/utility/ticketremove.js');
const { userDataCache } = require('./profilebutton.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (!interaction.customId.startsWith('remove_ticket_')) return;


        await interaction.deferUpdate();

        const userId = interaction.customId.split('_')[2];
        const selectedValue = interaction.values[0];

        let success;
        let message;

        if (selectedValue === 'all') {
            success = await removeAllTickets(userId, interaction);
            message = success ? 'All tickets have been removed.' : 'Failed to remove all tickets. Please try again.';
        } else {
            const selectedIndex = parseInt(selectedValue);
            success = await removeTicket(userId, selectedIndex, interaction);
            message = success ? `Ticket ${selectedIndex + 1} has been removed.` : 'Failed to remove the ticket. Please try again.';
        }
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (success) {
            if (userDataCache && userDataCache.tickets) {
                userDataCache.tickets.delete(userId);
            }
            
            await interaction.editReply({ 
                content: message, 
                embeds: [], 
                components: [] 
            });
        } else {
            await interaction.editReply({ 
                content: message, 
                embeds: [], 
                components: [] 
            });
        }
    },
};



