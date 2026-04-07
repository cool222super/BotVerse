


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D




const { InteractionType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getServerConfig } = require('../utils/serverConfig');

const jsonFilePath = path.join(__dirname, '..', 'data', 'earlyAccessLinks.json');
const startupFile = path.join(__dirname, '..', 'data', 'startup.json');

function initializeJsonFile() {
    try {
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let links = {};
        if (fs.existsSync(jsonFilePath)) {
            const data = fs.readFileSync(jsonFilePath, 'utf8');
            try {
                links = JSON.parse(data);
            } catch (error) {
                console.error('Error parsing existing JSON file:', error);
            }
        }

        if (!fs.existsSync(jsonFilePath)) {
            fs.writeFileSync(jsonFilePath, JSON.stringify(links, null, 2), 'utf8');
        }
        
        return links;
    } catch (error) {
        console.error('Error initializing JSON file:', error);
        return {};
    }
}

const links = initializeJsonFile();

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'early_access_link') {
            try {
                await interaction.deferReply({ ephemeral: true });

                const serverId = interaction.guild.id;
                const serverConfig = getServerConfig(serverId);

                if (!serverConfig || !serverConfig.earlyAccess || !serverConfig.earlyAccess.allowedRoles) {
                    return await interaction.editReply({
                        content: "Early access roles haven't been set up yet. Please ask an administrator to use the `/setup` command and configure 'Early Access' settings."
                    });
                }

                const allowedRoles = serverConfig.earlyAccess.allowedRoles;
                
                const hasAllowedRole = allowedRoles.some(roleId => 
                    interaction.member.roles.cache.has(roleId)
                );

                if (!hasAllowedRole) {
                    return await interaction.editReply({
                        content: 'You do not have permission to click on this button!'
                    });
                }

                try {
                    const startupData = JSON.parse(fs.readFileSync(startupFile, 'utf-8'));
                    const startupMessage = await interaction.channel.messages.fetch(startupData.messageId);
                    
                    const reaction = startupMessage.reactions.cache.get('✅');
                    if (!reaction) {
                        return await interaction.editReply({
                            content: `Please react to the startup message to have access to the early access link. React [here](${startupMessage.url}).`
                        });
                    }

                    const userReacted = await reaction.users.fetch().then(users => users.has(interaction.user.id));
                    if (!userReacted) {
                        return await interaction.editReply({
                            content: `Please react to the startup message to have access to the early access link. React [here](${startupMessage.url}).`
                        });
                    }

                    let currentLinks = {};
                    try {
                        if (fs.existsSync(jsonFilePath)) {
                            const data = fs.readFileSync(jsonFilePath, 'utf8');
                            currentLinks = JSON.parse(data);
                        }
                    } catch (error) {
                        console.error('Error reading links file:', error);
                    }

                    const link = currentLinks[interaction.message.id];

                    if (!link) {
                        return await interaction.editReply({
                            content: 'This early access link has expired or is no longer available.'
                        });
                    }

                    await interaction.editReply({
                        content: `**Early-Access:** ${link}`
                    });

                } catch (error) {
                    console.error('Error checking startup reaction:', error);
                    await interaction.editReply({
                        content: 'Please wait for the host to post the startup message.'
                    });
                }

            } catch (error) {
                console.error('Error handling early access button:', error);
                try {
                    if (!interaction.replied) {
                        await interaction.reply({
                            content: 'An error occurred while processing your request.',
                            ephemeral: true
                        });
                    } else {
                        await interaction.editReply({
                            content: 'An error occurred while processing your request.'
                        });
                    }
                } catch (e) {
                    console.error('Error sending error message:', e);
                }
            }
        }
    }
};
