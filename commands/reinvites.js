// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { hasStaffRole, getServerConfig } = require('../../utils/serverConfig');

const DATA_PATH = path.join(__dirname, '../../data/reinvites.json');

function saveReinvitesLink(link) {
    try {
        const dir = path.dirname(DATA_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_PATH, JSON.stringify({ link }, null, 2));
        global.reinviteLink = link;
    } catch (error) {
        console.error('Error saving reinvites link:', error);
    }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('re-invites')
    .setDescription('Re-invite session link')
    .addStringOption(option => 
      option.setName('link')
        .setDescription('Re-invites link (must be a valid URL)')
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

      const link = interaction.options.getString('link');
      
      if (!link.startsWith('https://')) {
        return interaction.reply({ content: 'Please provide a valid URL that starts with `https://`.', ephemeral: true });
      }
      
      saveReinvitesLink(link);

      const embed = new EmbedBuilder()
        .setColor('#77DD77');
      
      if (serverConfig.reinvites && serverConfig.reinvites.embedTitle) {
        embed.setTitle(serverConfig.reinvites.embedTitle);
      } else {
        embed.setTitle('**Southwest Florida Roleplay | Re-Invites Ongoing**');
      }
      
      if (serverConfig.reinvites && serverConfig.reinvites.embedDescription) {
        let description = serverConfig.reinvites.embedDescription;
        description = description.replace('{user}', `${interaction.user}`);
        embed.setDescription(description);
      } else {
        await interaction.reply({ 
          content: "You haven't set up the reinvites embed description yet. Please use the `/setup` command and select 'Reinvites' to configure it first.",
          ephemeral: true 
        });
        return;
      }
      
      if (serverConfig.reinvites && serverConfig.reinvites.imageUrl) {
        embed.setImage(serverConfig.reinvites.imageUrl);
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

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('reinvites_link')
            .setLabel('Re-invites Link')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ content: 'Re-invites Released!', ephemeral: true });

      await interaction.channel.send({
        content: '@here',
        embeds: [embed],
        components: [row],
        allowedMentions: { parse: ['everyone'] }
      });

      const logChannelId = '1355829280696696943'; 
      const logChannel = await interaction.client.channels.fetch(logChannelId);
      if (logChannel) {
        const staffRoleId = serverConfig.staffRole || 'Not configured';
        
        const logEmbed = new EmbedBuilder()
          .setTitle('Command Execution Log')
          .setDescription(`**Command:** /re-invites\n**Executed By:** ${interaction.user.tag} (${interaction.user.id})\n**Link:** ${link}`)
          .addFields(
            { name: 'Staff Role Used', value: `<@&${staffRoleId}>`, inline: false }
          )
          .setColor('#77DD77')
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error('Error in re-invites command:', error);
      await interaction.followUp({ 
        content: 'There was an error while executing this command!', 
        ephemeral: true 
      }).catch(console.error);
    }
  }
};
