// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const startupFile = path.join(dataDir, 'startup.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startup')
        .setDescription('Send session startup information embeds')
        .addStringOption(option =>
            option.setName('reactions')
                .setDescription('Number of reactions needed for the session to start')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const serverId = interaction.guild.id;
        
        const serverConfig = getServerConfig(serverId);
        console.log(`Server config for ${serverId}:`, serverConfig);
        
        if (!serverConfig || !serverConfig.staffRole) {
            await interaction.reply({ 
                content: "You haven't set up the staff role yet. Please use the `/setup` command to configure your staff role first.",
                ephemeral: true 
            });
            return;
        }
        
        if (!hasStaffRole(interaction.member, serverId)) {
            await interaction.reply({ 
                content: 'You do not have permission to use this command. Only staff members can use this command.',
                ephemeral: true 
            });
            return;
        }
        
        if (!serverConfig.startupEmbed) {
            await interaction.reply({ 
                content: "You haven't set up the startup embed yet. Please use the `/setup` command and select 'Startup Embed' to configure it first.",
                ephemeral: true 
            });
            return;
        }
        
        const optionReactions = interaction.options.getString('reactions');

        const embed = new EmbedBuilder()
            .setColor('#77DD77');
            
        if (serverConfig.startupEmbed.title) {
            embed.setTitle(serverConfig.startupEmbed.title);
        } else {
            embed.setTitle('Session Startup!');
        }
        
        if (serverConfig.startupEmbed.description) {
            let description = serverConfig.startupEmbed.description
                .replace('{user}', `<@${interaction.user.id}>`)
                .replace('{reactions}', optionReactions);
            
            embed.setDescription(description);
        }
        
        if (serverConfig.startupEmbed.imageUrl && serverConfig.startupEmbed.imageUrl.trim() !== '') {
            try {
                const url = serverConfig.startupEmbed.imageUrl.trim();
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    embed.setImage(url);
                } else {
                    console.warn(`Invalid image URL format in startup embed: ${url}`);
                }
            } catch (error) {
                console.error('Error setting image URL:', error);
            }
        }
        
        embed.setFooter({
            text: interaction.guild.name,
            iconURL: interaction.guild.iconURL() || null
        });
            
        await interaction.reply({ content: 'Startup Command Executed.', ephemeral: true });
        
        try {
            const sentMessage = await interaction.channel.send({ content: '@everyone', embeds: [embed] });
            await sentMessage.react('✅');

            const startupData = {
                messageId: sentMessage.id,
                channelId: sentMessage.channel.id,
                requiredReactions: parseInt(optionReactions)
            };

            fs.writeFileSync(startupFile, JSON.stringify(startupData, null, 2));
        } catch (error) {
            console.error('Error in startup command:', error);
            await interaction.followUp({ 
                content: 'There was an error while executing the command.', 
                ephemeral: true 
            });
            return;
        }

        const logChannelId = '1355829280696696943';
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            const staffRoleId = serverConfig.staffRole || 'Not configured';
            
            const logEmbed = new EmbedBuilder()
                .setTitle('Command Executed')
                .setDescription(`The \`/startup\` command was executed.`)
                .addFields(
                    { name: 'Executed by', value: `${interaction.user.tag}`, inline: true },
                    { name: 'User ID', value: `${interaction.user.id}`, inline: true },
                    { name: 'Channel', value: `${interaction.channel.name}`, inline: true },
                    { name: 'Reactions Required', value: `${optionReactions}`, inline: false },
                    { name: 'Staff Role Used', value: `<@&${staffRoleId}>`, inline: false }
                )
                .setColor('#77DD77')
                .setTimestamp();

            logChannel.send({ embeds: [logEmbed] });
        }
    }
};
