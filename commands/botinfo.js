


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const { version: nodeVersion } = require('process');
module.exports = {
    data: new SlashCommandBuilder()        
    .setName('botinfo')        
    .setDescription('Displays information about the bot'),   
     async execute(interaction) {
        const client = interaction.client;
        const apiLatency = client.ws.ping;   
     const messageLatency = Date.now() - interaction.createdTimestamp;
        const embed = new EmbedBuilder()            
        .setColor('#77DD77')
        .setTitle('Bot Information')           
             .addFields(
                { name: 'Bot Version', value: 'V1 Beta', inline: true },                { name: 'Discord.js Version', value: `v${version}`, inline: true },
                { name: 'Node.js Version', value: nodeVersion, inline: true },                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                { name: 'Uptime', value: formatUptime(client.uptime), inline: true },                { name: 'Developers', value: `<@881721027510550528>`, inline: true }
            )
            .setTimestamp()           
             .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
        await interaction.reply({ embeds: [embed] });
    },};
function formatUptime(uptime) {    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / 86400);    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
