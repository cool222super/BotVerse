// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settingup')
    .setDescription('Notifies that staff, boosters, emergency services, and content creators can join.'),

  async execute(interaction) {
    try {
      const serverId = interaction.guild.id;
      
      const serverConfig = getServerConfig(serverId);
      
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

      const settingUpMessage = 'Setting up. Staff, Boosters, Emergency Services & Content Creators may now join!';

      await interaction.reply({ content: 'Setting Message Released!', ephemeral: true });

      await interaction.channel.send(settingUpMessage);

      const logChannelId = '1355829280696696943';
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Command Execution Log')
          .setDescription(`**Command:** /settingup\n**Executed By:** ${interaction.user.tag} (${interaction.user.id})`)
          .addFields(
            { name: 'Channel', value: `#${interaction.channel.name}`, inline: true },
            { name: 'Staff Role Used', value: `<@&${serverConfig.staffRole}>`, inline: true }
          )
          .setColor('#77DD77')
          .setTimestamp();
        
        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error('Error in settingup command:', error);
      if (!interaction.replied) {
        await interaction.reply({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        });
      } else {
        await interaction.followUp({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        }).catch(console.error);
      }
    }
  }
};
