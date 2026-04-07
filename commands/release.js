


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a session with details and a join link.')
    .addStringOption(option =>
      option.setName('peacetime')
        .setDescription('Peacetime status')
        .setRequired(true)
        .addChoices(
          { name: 'On', value: 'On' },
          { name: 'Strict', value: 'Strict' },
          { name: 'Off', value: 'Off' }
        ))
    .addStringOption(option =>
      option.setName('frp-speeds')
        .setDescription('FRP speeds status')
        .setRequired(true)
        .addChoices(
          { name: '75', value: '75' },
          { name: '65', value: '65' },
          { name: '85', value: '85' }
        ))
    .addStringOption(option =>
      option.setName('drifting-status')
        .setDescription('Drifting status')
        .setRequired(true)
        .addChoices(
          { name: 'On', value: 'On' },
          { name: 'Corners Only', value: 'Corners Only' },
          { name: 'Off', value: 'Off' }
        ))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Session link')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

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

      await interaction.deferReply({ ephemeral: true });
      
      const peacetime = interaction.options.getString('peacetime');
      const frpSpeeds = interaction.options.getString('frp-speeds');
      const driftingStatus = interaction.options.getString('drifting-status');
      const link = interaction.options.getString('link');

      const embed = new EmbedBuilder()
        .setColor('#77DD77')
        .setTimestamp();
      
      if (serverConfig.release && serverConfig.release.embedTitle) {
        embed.setTitle(serverConfig.release.embedTitle);
      } else {
        embed.setTitle('Session Released');
      }
      
      if (serverConfig.release && serverConfig.release.embedDescription) {
        let description = serverConfig.release.embedDescription
          .replace('{host}', `${interaction.user}`)
          .replace('{peacetime}', peacetime)
          .replace('{frp-speeds}', frpSpeeds)
          .replace('{drifting-status}', driftingStatus);
        
        embed.setDescription(description);
      } else {
        await interaction.followUp({ 
          content: "You haven't set up the release embed description yet. Please use the `/setup` command and select 'Release' to configure it first.",
          ephemeral: true 
        });
        return;
      }
      
      if (serverConfig.release && serverConfig.release.imageUrl && serverConfig.release.imageUrl.trim() !== '') {
        try {
          const url = serverConfig.release.imageUrl.trim();
          if (url.startsWith('http://') || url.startsWith('https://')) {
            embed.setImage(url);
          }
        } catch (error) {
          console.error('Error setting image URL:', error);
        }
      }
      
      if (interaction.guild.iconURL()) {
        embed.setFooter({
          text: interaction.guild.name,
          iconURL: interaction.guild.iconURL()
        });
      } else {
        embed.setFooter({
          text: interaction.guild.name
        });
      }

      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`session_link_${link}`)
            .setLabel('Get Session Link')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.followUp({ content: 'Session released!', ephemeral: true });

      const roleToPing = serverConfig.civilianRole || '1334707227805618244';

      await interaction.channel.send({
        content: `@here`,
        embeds: [embed],
        components: [buttons],
        allowedMentions: { 
          parse: ['everyone'],
          roles: [roleToPing]
        }
      });

      const logChannelId = '1355829280696696943'; 
      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const staffRoleId = serverConfig.staffRole || 'Not configured';
        
        const logEmbed = new EmbedBuilder()
          .setTitle('Command Executed')
          .setDescription('The `/release` command was executed.')
          .addFields(
            { name: 'Executed by', value: `${interaction.user.tag}`, inline: true },
            { name: 'User ID', value: `${interaction.user.id}`, inline: true },
            { name: 'Channel', value: `${interaction.channel.name}`, inline: true },
            { name: 'Peacetime', value: peacetime, inline: true },
            { name: 'FRP Speeds', value: frpSpeeds, inline: true },
            { name: 'Drifting Status', value: driftingStatus, inline: true },
            { name: 'Staff Role Used', value: `<@&${staffRoleId}>`, inline: false }
          )
          .setColor('#77DD77')
          .setTimestamp();

        logChannel.send({ embeds: [logEmbed] });
      }

    } catch (error) {
      console.error('Error in release command:', error);
      await interaction.followUp({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      }).catch(console.error);
    }
  }
};
