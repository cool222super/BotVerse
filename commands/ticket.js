// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { userDataCache } = require('../../events/profilebutton.js');
const { getServerConfig } = require('../../utils/serverConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Issue a ticket to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to issue the ticket to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('offense')
                .setDescription('The offense committed')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('fine')
                .setDescription('The fine amount')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const serverConfig = getServerConfig(serverId);
            
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
                    content: 'You do not have permission to use this command. Only LEO roles can issue tickets.',
                    ephemeral: true 
                });
            }

            const user = interaction.options.getUser('user');
            const offense = interaction.options.getString('offense');
            const fine = interaction.options.getInteger('fine');

            const ticketData = {
                offense: offense,
                price: fine,
                count: 1,
                date: new Date(),
                issuedBy: interaction.user.id
            };

            console.log('New ticket data:', ticketData);

            const ticketsDir = path.join(__dirname, '..', '..', 'data', 'tickets');
            const ticketPath = path.join(ticketsDir, `${user.id}.json`);

            if (!fs.existsSync(ticketsDir)) {
                fs.mkdirSync(ticketsDir, { recursive: true });
            }

            let tickets = [];
            try {
                if (fs.existsSync(ticketPath)) {
                    tickets = JSON.parse(fs.readFileSync(ticketPath, 'utf8'));
                }
            } catch (error) {
                console.error('Error reading tickets file:', error);
            }

            tickets.push(ticketData);

            fs.writeFileSync(ticketPath, JSON.stringify(tickets, null, 2));

            if (userDataCache && userDataCache.tickets) {
                userDataCache.tickets.delete(user.id);
            }
            
            const embed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTitle('Ticket Issued')
                .addFields(
                    { name: 'User', value: user.toString(), inline: true },
                    { name: 'Offense', value: offense, inline: true },
                    { name: 'Fine', value: `${fine}`, inline: true },
                    { name: 'Issued by', value: interaction.user.toString() }
                )
                .setTimestamp();

            const dmEmbed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTitle(`You have received a Ticket in ${interaction.guild.name} for following:`)
                .setDescription(
                    `**Offenses:** ${offense}\n` +
                    `**User:** ${user.toString()}\n` +
                    `**Fine:** ${fine}\n\n` +
                    'If you believe that there has been a mistake or issue please kindly request that you reach out to one of the department High Ranking. To make sure there was no mistake or misunderstanding.\n\n' +
                    `**Issued by:** ${interaction.user.tag}`
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.error('Could not send DM to user:', error);
                await interaction.followUp({ 
                    content: 'Ticket issued, but I could not send a DM to the user.',
                    ephemeral: true 
                });
            }

        } catch (error) {
            console.error('Error issuing ticket:', error);
            if (!interaction.replied) {
                await interaction.reply({ 
                    content: 'Failed to issue the ticket. Please try again.',
                    ephemeral: true 
                });
            }
        }
    },
};
