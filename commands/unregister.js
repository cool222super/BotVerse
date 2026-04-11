// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, MessageFlags } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { getServerConfig } = require('../../utils/serverConfig');

const dataFolderPath = path.join(__dirname, '../../data/vehicleData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unregister')
        .setDescription('Unregister a vehicle from your profile.'),

    async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;
        const member = interaction.member;
        const guildId = interaction.guild.id;

        const userFilePath = path.join(dataFolderPath, `${userId}.json`);

        try {
            const serverConfig = getServerConfig(guildId);
            
            console.log('Server config:', JSON.stringify(serverConfig, null, 2));
            
            if (serverConfig && serverConfig.civilianRole) {
                const civilianRoleId = serverConfig.civilianRole;
                console.log(`Checking for civilian role: ${civilianRoleId}`);
                
                if (!member.roles.cache.has(civilianRoleId)) {
                    return await interaction.reply({
                        content: `You need the <@&${civilianRoleId}> role to use this command.`,
                        ephemeral: true
                    });
                }
            }
            else if (serverConfig && serverConfig.roles && serverConfig.roles.civilian) {
                const civilianRoleId = serverConfig.roles.civilian;
                console.log(`Checking for civilian role (old format): ${civilianRoleId}`);
                
                if (!member.roles.cache.has(civilianRoleId)) {
                    return await interaction.reply({
                        content: `You need the <@&${civilianRoleId}> role to use this command.`,
                        ephemeral: true
                    });
                }
            }
            else {
                return await interaction.reply({
                    content: 'Server roles have not been configured yet. Please ask an administrator to use the `/setup` command first.',
                    ephemeral: true
                });
            }

            let userData = {
                lastUpdated: new Date().toISOString(),
                items: [],
                metadata: {
                    type: "vehicles",
                    version: "1.0"
                }
            };

            if (fs.existsSync(userFilePath)) {
                const rawData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
                userData.items = rawData.items || rawData;
            }

            if (userData.items.length === 0) {
                return interaction.reply({ 
                    content: 'You have no vehicles registered to unregister.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const selectMenuOptions = userData.items.map((vehicle, index) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Vehicle ${index + 1}`)
                    .setValue(index.toString())
                    .setDescription(`Year: ${vehicle.year}, Make: ${vehicle.make}, Model: ${vehicle.model}`)
            );

            selectMenuOptions.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Remove All Vehicles')
                    .setValue('remove_all')
                    .setDescription('Remove all registered vehicles')
            );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_vehicle')
                .setPlaceholder('Select a vehicle to unregister or remove all vehicles')
                .addOptions(selectMenuOptions);

            const row = new ActionRowBuilder()
                .addComponents(selectMenu);

            const embed = new EmbedBuilder()
                .setTitle('Your Registered Vehicles')
                .setColor('#77DD77');

            userData.items.forEach((vehicle, index) => {
                embed.addFields({
                    name: `Vehicle ${index + 1}`,
                    value: `**Year:** ${vehicle.year}\n**Make:** ${vehicle.make}\n**Model:** ${vehicle.model}\n**Color:** ${vehicle.color}\n**Number Plate:** ${vehicle.numberPlate}`,
                    inline: true
                });
            });

            embed.setDescription('Please select the vehicle you want to unregister or choose to remove all vehicles from the dropdown below.');

            const reply = await interaction.reply({
                embeds: [embed],
                components: [row],
                flags: MessageFlags.Ephemeral,
                fetchReply: true
            });

            const filter = i => i.customId === 'select_vehicle' && i.user.id === interaction.user.id;
            const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

            collector.on('collect', async i => {
                const selectedValue = i.values[0];

                if (selectedValue === 'remove_all') {
                    fs.unlinkSync(userFilePath);
                    
                    if (interaction.client.vehicleData) {
                        delete interaction.client.vehicleData[userId];
                    }

                    const confirmationEmbed = new EmbedBuilder()
                        .setTitle('All Vehicles Removed')
                        .setDescription('All your registered vehicles have been successfully removed.')
                        .setColor('#77DD77');

                    await i.update({
                        embeds: [confirmationEmbed],
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    const selectedIndex = parseInt(selectedValue, 10);
                    const removedVehicle = userData.items.splice(selectedIndex, 1)[0];

                    if (userData.items.length > 0) {
                        userData.lastUpdated = new Date().toISOString();
                        fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2), 'utf8');
                        
                        if (interaction.client.vehicleData) {
                            interaction.client.vehicleData[userId] = userData.items;
                        }
                    } else {
                        fs.unlinkSync(userFilePath);
                        
                        if (interaction.client.vehicleData) {
                            delete interaction.client.vehicleData[userId];
                        }
                    }

                    const confirmationEmbed = new EmbedBuilder()
                        .setTitle('Vehicle Unregistered')
                        .setDescription(`**Year:** ${removedVehicle.year}\n**Make:** ${removedVehicle.make}\n**Model:** ${removedVehicle.model}\n**Color:** ${removedVehicle.color}\n**Number Plate:** ${removedVehicle.numberPlate}`)
                        .setColor('#77DD77');

                    await i.update({
                        embeds: [confirmationEmbed],
                        components: [],
                        flags: MessageFlags.Ephemeral
                    });
                }
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.editReply({ components: [] }).catch(console.error);
                }
            });

        } catch (error) {
            console.error('Error unregistering vehicle:', error);
            await interaction.reply({ 
                content: 'Failed to unregister vehicle.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    },
};
