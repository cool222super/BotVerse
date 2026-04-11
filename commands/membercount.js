// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Displays the number of members in the server'),
    
    async execute(interaction) {
        const guild = interaction.guild;
        const memberCount = guild.memberCount;

        const embed = new EmbedBuilder()
            .setTitle('Member Count')
            .setDescription(`${memberCount} members`)
            .setColor('#77DD77');

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};
