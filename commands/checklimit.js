

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checklimit')
        .setDescription('Check the current vehicle registration limit'),

    async execute(interaction) {
        try {
            const serverId = interaction.guild.id;
            const configPath = path.join(process.cwd(), 'data', 'serverConfig', `${serverId}.json`);
            
            if (!fs.existsSync(configPath)) {
                return await interaction.reply({
                    content: 'No server configuration found. The default vehicle limit is 3.',
                    ephemeral: true
                });
            }
            
            const rawData = fs.readFileSync(configPath, 'utf8');
            console.log(`Raw config data: ${rawData}`);
            
            const config = JSON.parse(rawData);
            console.log(`Parsed config: ${JSON.stringify(config, null, 2)}`);
            
            const vehicleLimit = config.vehicleLimit !== undefined ? config.vehicleLimit : 3;
            
            const embed = new EmbedBuilder()
                .setColor('#77DD77')
                .setTitle('Vehicle Registration Limit')
                .setDescription(`Current vehicle registration limit: **${vehicleLimit}**`)
                .addFields(
                    { name: 'Server ID', value: serverId, inline: true }
                )
                .setTimestamp();
            
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
            
        } catch (error) {
            console.error('Error in checklimit command:', error);
            await interaction.reply({
                content: 'An error occurred while checking the vehicle limit.',
                ephemeral: true
            });
        }
    },
};
