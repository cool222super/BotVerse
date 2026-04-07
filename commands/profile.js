


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D





const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { getRoleConfig } = require('../../utils/roleCheck');

const dataFolderPath = path.join(__dirname, '../../data/vehicleData');
const ticketsDirPath = path.join(__dirname, '../../data/tickets');
const licensesDirPath = path.join(__dirname, '../../data/licenses');

const loadVehicleCount = (discordUserId) => {
    try {
        const vehicleFilePath = path.join(__dirname, '..', '..', 'data', 'vehicleData', `${discordUserId}.json`);
        if (fs.existsSync(vehicleFilePath)) {
            const data = JSON.parse(fs.readFileSync(vehicleFilePath, 'utf8'));
            if (data.items) {
                return data.items.length;
            }
            if (Array.isArray(data)) {
                return data.length;
            }
            return 0;
        }
        return 0;
    } catch (error) {
        console.error('Error loading vehicle count:', error);
        return 0;
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays your Roblox profile or another user\'s profile.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to view their Roblox profile. If not selected, shows your profile.')),

    async execute(interaction) {
        try {
            const roleConfig = getRoleConfig(interaction.guild.id);
            if (!roleConfig || !roleConfig.civillian) {
                return await interaction.reply({
                    content: 'Server roles have not been configured yet. Please ask an administrator to use the `/roleset` command first.',
                    ephemeral: true
                });
            }

            const civilianRoleId = roleConfig.civillian.role1;
            if (!civilianRoleId || !interaction.member.roles.cache.has(civilianRoleId)) {
                return await interaction.reply({
                    content: `You need the <@&${civilianRoleId}> role to use this command.`,
                    ephemeral: true
                });
            }

            const selectedUser = interaction.options.getUser('user') || interaction.user;

            if (selectedUser.bot) {
                return await interaction.reply({ 
                    content: 'You cannot view profiles of discord bots!',
                    ephemeral: true 
                });
            }

            const discordUserId = selectedUser.id;
            const guildId = interaction.guild.id;

            const vehicleData = loadJsonFile(path.join(dataFolderPath, `${discordUserId}.json`)) || [];
            const ticketsData = loadJsonFile(path.join(ticketsDirPath, `${discordUserId}.json`)) || [];

            await interaction.deferReply({ ephemeral: false });

            try {
                const bloxlinkApiKey = process.env.BLOXLINK;
                const bloxlinkApiUrl = `https://api.blox.link/v4/public/guilds/${guildId}/discord-to-roblox/${discordUserId}`;
                
                const bloxlinkResponse = await axios.get(bloxlinkApiUrl, {
                    headers: {
                        'Authorization': bloxlinkApiKey,
                        'api-key': bloxlinkApiKey
                    }
                });

                if (!bloxlinkResponse.data?.robloxID) {
                    return await interaction.editReply({
                        content: 'No Roblox account linked. Please verify at https://blox.link/verify'
                    });
                }

                const robloxUserId = bloxlinkResponse.data.robloxID;

                const robloxUserResponse = await axios.get(`https://users.roblox.com/v1/users/${robloxUserId}`);
                const robloxUsername = robloxUserResponse.data.name;

                const thumbnailResponse = await axios.get(
                    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUserId}&size=420x420&format=Png&isCircular=false`
                );
                const robloxProfilePicture = thumbnailResponse.data.data[0]?.imageUrl || '';

                let licenseStatus = 'Vaild';
                const licenseFilePath = path.join(licensesDirPath, `${discordUserId}.json`);
                if (fs.existsSync(licenseFilePath)) {
                    const licenses = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));
                    if (licenses.length > 0) {
                        const latestLicense = licenses[licenses.length - 1];
                        licenseStatus = latestLicense.status;
                    }
                }

                const vehicleCount = loadVehicleCount(discordUserId);

                const profileEmbed = new EmbedBuilder()
                   .setTitle(`${selectedUser.username}'s Profile`)
                    .setDescription(`
                        **Discord User:** <@${discordUserId}>
                        **Roblox Username:** [${robloxUsername}](https://www.roblox.com/users/${robloxUserId}/profile)
                        **License Status:** ${licenseStatus}
                        **Vehicle Count:** ${vehicleCount}
                        **Ticket Count:** ${ticketsData.length}
                    `)
                    .setColor('#77DD77')
                    .setThumbnail(robloxProfilePicture)
                    .setTimestamp();

                const actionRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`show_registrations_${discordUserId}`)
                            .setLabel('View Registrations')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`show_tickets_${discordUserId}`)
                            .setLabel('View Tickets')
                            .setStyle(ButtonStyle.Secondary)
                    );

                await interaction.editReply({
                    embeds: [profileEmbed],
                    components: [actionRow]
                });

            } catch (error) {
                console.error('API Error:', error);
                await interaction.editReply({
                    content: 'Failed to fetch profile information. Please try again later.'
                });
            }

        } catch (error) {
            console.error('Error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while fetching the profile information.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'An error occurred while fetching the profile information.'
                });
            }
        }
    }
};

function loadJsonFile(filePath) {
    try {
        return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : [];
    } catch {
        return [];
    }
}

