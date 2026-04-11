// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getVehicleLimit, hasCivilianRole } = require('../../utils/serverConfig');

const dataDirPath = path.join(__dirname, '../../data/vehicleData');
const logChannelId = '1334707231555452952';

const loadUserData = async (userId, dataType) => {
    try {
        const dataPath = path.join(dataDirPath, `${userId}.json`);

        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const parsedData = JSON.parse(rawData);
            
            if (parsedData.items) {
                return parsedData.items;
            }
            if (Array.isArray(parsedData)) {
                return parsedData;
            }
            return [];
        }
        return [];
    } catch (error) {
        console.error(`Error loading ${dataType} data:`, error);
        return [];
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register your vehicle.')
        .addIntegerOption(option =>
            option.setName('year')
                .setDescription('Vehicle Year')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('make')
                .setDescription('Vehicle Make')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('model')
                .setDescription('Vehicle Model')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Vehicle Color')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('number-plate')
                .setDescription('Vehicle Number Plate')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            console.log(`Processing register command for server: ${serverId}`);
            
            if (!hasCivilianRole(interaction.member, serverId)) {
                return await interaction.reply({
                    content: `You need the civilian role to use this command.`,
                    ephemeral: true
                });
            }
            
            const configPath = path.join(process.cwd(), 'data', 'serverConfig', `${serverId}.json`);
            let vehicleLimit = 3; 

            try {
                if (fs.existsSync(configPath)) {
                    const configData = fs.readFileSync(configPath, 'utf8');
                    console.log(`Raw config data for ${serverId}: ${configData}`);
                    
                    const config = JSON.parse(configData);
                    console.log(`Parsed config for ${serverId}: ${JSON.stringify(config, null, 2)}`);
                    
                    if (config.vehicleLimit !== undefined) {
                        vehicleLimit = Number(config.vehicleLimit);
                        console.log(`Found vehicle limit in config: ${vehicleLimit}`);
                    }
                } else {
                    console.log(`No config file found for server ${serverId}, using default limit of 3`);
                }
            } catch (error) {
                console.error(`Error reading vehicle limit for ${serverId}:`, error);
            }

            console.log(`Final vehicle limit for server ${serverId}: ${vehicleLimit}`);

            const userId = interaction.user.id;
            const userVehicles = await loadUserData(userId, 'vehicles');
            console.log(`User ${userId} has ${userVehicles.length} vehicles registered`);
            
            if (userVehicles.length >= vehicleLimit) {
                console.log(`User ${userId} has reached vehicle limit: ${userVehicles.length}/${vehicleLimit}`);
                return await interaction.reply({
                    content: `You have reached the maximum limit of ${vehicleLimit} registered vehicles. Please unregister a vehicle before registering a new one.`,
                    ephemeral: true
                });
            }
            
            const year = interaction.options.getInteger('year');
            const make = interaction.options.getString('make');
            const model = interaction.options.getString('model');
            const color = interaction.options.getString('color');
            const numberPlate = interaction.options.getString('number-plate');

            if (!fs.existsSync(dataDirPath)) {
                fs.mkdirSync(dataDirPath, { recursive: true });
            }

            const userFilePath = path.join(dataDirPath, `${userId}.json`);

            let userData = {
                lastUpdated: new Date().toISOString(),
                items: [],
                metadata: {
                    type: "vehicles",
                    version: "1.0"
                }
            };

            if (fs.existsSync(userFilePath)) {
                userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
            }

            userData.items.push({
                year,
                make,
                model,
                color,
                numberPlate
            });

            userData.lastUpdated = new Date().toISOString();

            fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2), 'utf8');

            const embed = new EmbedBuilder()
                .setColor(`#77DD77`)
                .setTitle('Vehicle Registered')
                .setDescription('Your vehicle has been successfully registered.');

            await interaction.reply({ embeds: [embed], ephemeral: true });

            try {
                const logChannel = await interaction.guild.channels.fetch(logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#77DD77')
                        .setTitle('New Vehicle Registration')
                        .setDescription(`**User:** <@${userId}>\n**Year:** ${year}\n**Make:** ${make}\n**Model:** ${model}\n**Color:** ${color}\n**Number Plate:** ${numberPlate}`);
                    await logChannel.send({ embeds: [logEmbed] });
                }
            } catch (error) {
                console.error('Failed to send log message:', error);
            }

        } catch (error) {
            console.error('Error in register command:', error);
            await interaction.reply({
                content: 'An error occurred while registering your vehicle.',
                ephemeral: true
            });
        }
    },
};
