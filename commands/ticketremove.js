



// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getServerConfig } = require('../../utils/serverConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticketremove')
        .setDescription('Remove tickets from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove tickets from')
                .setRequired(true)),

    async execute(interaction) {
        const serverId = interaction.guild.id;
        const serverConfig = getServerConfig(serverId);
        
        // Check if LEO roles are configured
        if (!serverConfig || !serverConfig.leoRoles || !serverConfig.leoRoles.length) {
            return await interaction.reply({ 
                content: "LEO roles haven't been set up yet. Please ask an administrator to use the `/setup` command and configure 'LEO Role' settings.",
                ephemeral: true 
            });
        }
        
        const hasLeoRole = serverConfig.leoRoles.some(roleId => 
            interaction.member.roles.cache.has(roleId)
        );
        
        if (!hasLeoRole) {
            return await interaction.reply({ 
                content: 'You do not have permission to use this command. Only LEO roles can remove tickets.',
                ephemeral: true 
            });
        }

        const user = interaction.options.getUser('user');
        const tickets = getTickets(user.id);

        if (tickets.length === 0) {
            return interaction.reply({ content: 'This user has no tickets.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle(`Tickets for ${user.username}`)
            .setDescription('Select a ticket to remove:');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`remove_ticket_${user.id}`)
            .setPlaceholder('Choose a ticket to remove')
            .addOptions({
                label: 'Remove All Tickets',
                description: 'Remove all tickets from this user',
                value: 'all'
            });

        tickets.forEach((ticket, index) => {
            embed.addFields({ name: `Ticket ${index + 1}`, value: ticket.offense });
            selectMenu.addOptions({
                label: `Ticket ${index + 1}`,
                description: ticket.offense.substring(0, 50),
                value: index.toString()
            });
        });

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};

function getTickets(userId) {
    const filePath = path.join(__dirname, '..', '..', 'data', 'tickets', `${userId}.json`);
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading tickets:', error);
    }
    return [];
}

async function removeTicket(userId, index, interaction) {
    const filePath = path.join(__dirname, '..', '..', 'data', 'tickets', `${userId}.json`);
    try {
        if (fs.existsSync(filePath)) {
            const tickets = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const removedTicket = tickets[index];
            tickets.splice(index, 1);
            fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2));

            // Create DM embed with removed ticket details
            const dmEmbed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTitle(`Ticket Removed in ${interaction.guild.name}`)
                .addFields(
                    { name: 'Offense', value: removedTicket.offense },
                    { name: 'Fine', value: `${removedTicket.price}`, inline: true },
                    { name: 'Date Issued', value: new Date(removedTicket.date).toLocaleString(), inline: true }
                )
                .setTimestamp();

            try {
                if (interaction) {
                    const user = await interaction.client.users.fetch(userId);
                    await user.send({ embeds: [dmEmbed] });
                }
            } catch (error) {
                console.error('Could not send DM to user:', error);
            }

            return true;
        }
    } catch (error) {
        console.error('Error removing ticket:', error);
    }
    return false;
}

async function removeAllTickets(userId, interaction) {
    const filePath = path.join(__dirname, '..', '..', 'data', 'tickets', `${userId}.json`);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); 
            
            const dmEmbed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTitle(`All Tickets Removed in ${interaction.guild.name}`)
                .addFields(
                    { name: 'Removed by', value: interaction.user.tag },
                    { name: 'Server', value: interaction.guild.name }
                )
                .setTimestamp();

            try {
                const user = await interaction.client.users.fetch(userId);
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not send DM to user:', error);
            }

            return true;
        }
    } catch (error) {
        console.error('Error removing all tickets:', error);
    }
    return false;
}

module.exports.removeTicket = removeTicket;
module.exports.removeAllTickets = removeAllTickets;
