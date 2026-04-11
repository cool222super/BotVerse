// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('over')
    .setDescription('End a session and send a conclusion embed')
    .addStringOption(option => 
      option.setName('duration')
        .setDescription('The duration of the session')
        .setRequired(true)),
  async execute(interaction) {
    try {
      const serverId = interaction.guild.id;
      
      const serverConfig = getServerConfig(serverId);
      console.log(`Server config for ${serverId}:`, serverConfig);
      
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

      await interaction.reply({ content: 'Session ended!', ephemeral: true });

      const duration = interaction.options.getString('duration');
      const logChannelId = '1355829280696696943'; 

      const embed = new EmbedBuilder()
        .setColor('#77DD77')
        .setTimestamp();
      
      if (serverConfig.over && serverConfig.over.embedTitle) {
        embed.setTitle(serverConfig.over.embedTitle);
      } else {
        embed.setTitle('**Session Concluded**');
      }
      
      if (serverConfig.over && serverConfig.over.embedDescription) {
        let description = serverConfig.over.embedDescription
          .replace('{user}', `<@${interaction.user.id}>`)
          .replace('{duration}', duration);
        
        embed.setDescription(description);
      } else {
        embed.setDescription(`Session ended by <@${interaction.user.id}> (${duration})`);
      }
      
      if (serverConfig.over && serverConfig.over.imageUrl && serverConfig.over.imageUrl.trim() !== '') {
        try {
          const url = serverConfig.over.imageUrl.trim();
          if (url.startsWith('http://') || url.startsWith('https://')) {
            embed.setImage(url);
          }
        } catch (error) {
          console.error('Error setting image URL:', error);
        }
      }
      
      embed.setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL()
      });

      const feedbackButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('session_feedback')
            .setLabel('Session Feedback')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.channel.send({ 
        embeds: [embed],
        components: [feedbackButton]
      });

      const logEmbed = new EmbedBuilder()
        .setTitle('Command Execution Log')
        .setDescription(`**Command:** /over\n**Executed By:** ${interaction.user.tag} (${interaction.user.id})\n**Duration:** ${duration}`)
        .addFields(
          { name: 'Staff Role Used', value: `<@&${serverConfig.staffRole}>`, inline: false }
        )
        .setColor('#77DD77')
        .setTimestamp();

      const logChannel = await interaction.client.channels.fetch(logChannelId);
      if (logChannel) {
        await logChannel.send({ embeds: [logEmbed] });
      } else {
        console.error(`Log channel with ID ${logChannelId} not found.`);
      }
    } catch (error) {
      console.error('Error in over command:', error);
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
