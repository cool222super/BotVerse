

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

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
