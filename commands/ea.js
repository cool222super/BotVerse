

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'earlyAccessLinks.json');

function initializeJsonFile() {
    try {
        const dataDir = path.join(__dirname, '..', '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        if (!fs.existsSync(jsonFilePath)) {
            fs.writeFileSync(jsonFilePath, JSON.stringify({}, null, 2), 'utf8');
            console.log('Created earlyAccessLinks.json file');
        }
    } catch (error) {
        console.error('Error initializing JSON file:', error);
    }
}

initializeJsonFile();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('earlyaccess')
        .setDescription('Grant early access to a user with a link')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The link for early access')
                .setRequired(true)),

    async execute(interaction) {
        try {
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
            
            if (!serverConfig.earlyAccess) {
                await interaction.reply({ 
                    content: "You haven't set up early access settings yet. Please use the `/setup` command and select 'Early Access' to configure it first.",
                    ephemeral: true 
                });
                return;
            }

            await interaction.reply({ content: 'Early access released!', ephemeral: true });

            const link = interaction.options.getString('link');
            
            const embed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTimestamp();
            
            if (serverConfig.earlyAccess.embedTitle) {
                embed.setTitle(serverConfig.earlyAccess.embedTitle);
            } else {
                embed.setTitle('Early Access Now Open');
            }
            
            if (serverConfig.earlyAccess.embedDescription) {
                embed.setDescription(serverConfig.earlyAccess.embedDescription);
            } else {
                embed.setDescription('Early Access is now live. Click the button below to access the session.');
            }
            
            if (serverConfig.earlyAccess.imageUrl && serverConfig.earlyAccess.imageUrl.trim() !== '') {
                try {
                    const url = serverConfig.earlyAccess.imageUrl.trim();
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        embed.setImage(url);
                    }
                } catch (error) {
                    console.error('Error setting image URL:', error);
                }
            }
            
            embed.setFooter({
                text: interaction.guild.name,
                iconURL: interaction.guild.iconURL() || null
            });

            const button = new ButtonBuilder()
                .setLabel('Early Access Link')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('early_access_link');

            const row = new ActionRowBuilder().addComponents(button);
            
            let content = '';
            if (serverConfig.earlyAccess.pingRoles && serverConfig.earlyAccess.pingRoles.length > 0) {
                content = serverConfig.earlyAccess.pingRoles.map(roleId => `<@&${roleId}>`).join(' ');
            }

            const message = await interaction.channel.send({
                content: content,
                embeds: [embed],
                components: [row]
            });

            initializeJsonFile();

            try {
                let links = {};
                const data = fs.readFileSync(jsonFilePath, 'utf8');
                links = JSON.parse(data);
                
                links[message.id] = link;
                fs.writeFileSync(jsonFilePath, JSON.stringify(links, null, 2));
            } catch (error) {
                console.error('Error storing link in JSON:', error);
            }

            const logChannelId = '1355829280696696943';
            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                const staffRoleId = serverConfig.staffRole || 'Not configured';
                
                const logEmbed = new EmbedBuilder()
                    .setTitle('Command Executed')
                    .setDescription('The `/earlyaccess` command was executed.')
                    .addFields(
                        { name: 'Executed by', value: `${interaction.user.tag}`, inline: true },
                        { name: 'User ID', value: `${interaction.user.id}`, inline: true },
                        { name: 'Channel', value: `${interaction.channel.name}`, inline: true },
                        { name: 'Link Provided', value: `${link}`, inline: false },
                        { name: 'Staff Role Used', value: `<@&${staffRoleId}>`, inline: false }
                    )
                    .setColor('#77DD77')
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Error in earlyaccess command:', error);
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true
            }).catch(console.error);
        }
    }
};
