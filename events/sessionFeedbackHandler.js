// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'session_feedback') return;

    const modal = new ModalBuilder()
      .setCustomId('session_feedback_modal')
      .setTitle('Session Feedback');

    const hostInput = new TextInputBuilder()
      .setCustomId('host')
      .setLabel('Who was the host?')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter the host's name")
      .setRequired(true);

    const ratingInput = new TextInputBuilder()
      .setCustomId('rating')
      .setLabel('Session Rating (1-10)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('1 - 10')
      .setRequired(true);

    const improvementInput = new TextInputBuilder()
      .setCustomId('improvement')
      .setLabel('What can we improve?')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Tell us what could be better')
      .setRequired(true);

    const notesInput = new TextInputBuilder()
      .setCustomId('notes')
      .setLabel('Additional Notes (optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Anything else you want to add')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(hostInput),
      new ActionRowBuilder().addComponents(ratingInput),
      new ActionRowBuilder().addComponents(improvementInput),
      new ActionRowBuilder().addComponents(notesInput)
    );

    try {
      await interaction.showModal(modal);
    } catch (err) {
      console.error('Failed to show feedback modal:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'An error occurred while trying to open the feedback form. Please try again later.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }
};
