

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder } = require('discord.js');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('co-host')
    .setDescription('Announces that the user is now co-hosting the session.'),
  
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

      const coHostMessage = `${interaction.user} is now co-hosting this session!`;

      await interaction.reply({ content: 'Co-host Message Released!', ephemeral: true });

      await interaction.channel.send(coHostMessage);
    } catch (error) {
      console.error('Error in co-host command:', error);
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
