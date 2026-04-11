// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'session_feedback_modal') return;

    try {
      const host = interaction.fields.getTextInputValue('host');
      const rating = parseInt(interaction.fields.getTextInputValue('rating'), 10);
      const improvement = interaction.fields.getTextInputValue('improvement');
      const notes =
        interaction.fields.getTextInputValue('notes') || 'No additional notes provided';

      if (isNaN(rating) || rating < 1 || rating > 10) {
        return interaction.reply({
          content: 'Please provide a rating between 1 and 10.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle('Session Feedback Received')
        .setDescription(`Feedback from ${interaction.user.tag}`)
        .addFields(
          { name: 'Host', value: host, inline: true },
          { name: 'Rating', value: `${rating}/10`, inline: true },
          { name: 'Improvements', value: improvement },
          { name: 'Additional Notes', value: notes }
        )
        .setColor('#77DD77')
        .setTimestamp();

      const channelId = '1355829280696696943';
      const channel = await interaction.client.channels.fetch(channelId).catch(() => null);

      if (!channel) {
        return interaction.reply({
          content: 'Feedback channel not found.',
          ephemeral: true
        });
      }

      await channel.send({ embeds: [embed] });

      return interaction.reply({
        content: 'Thanks for your feedback!',
        ephemeral: true
      });

    } catch (err) {
      console.error('Feedback modal error:', err);

      if (!interaction.replied) {
        return interaction.reply({
          content: 'An error occurred while sending your feedback.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }
};
