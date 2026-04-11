// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/reinvites.json');
const STARTUP_FILE = path.join(__dirname, '../data/startup.json');

function loadReinvitesLink() {
  try {
    if (!fs.existsSync(DATA_PATH)) return null;

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    return data?.link || null;
  } catch (err) {
    console.error('Failed to load reinvites link:', err);
    return null;
  }
}

function loadStartupMessageId() {
  try {
    if (!fs.existsSync(STARTUP_FILE)) return null;

    const data = JSON.parse(fs.readFileSync(STARTUP_FILE, 'utf8'));
    return data?.messageId || null;
  } catch (err) {
    console.error('Failed to load startup file:', err);
    return null;
  }
}

async function userReactedWithCheck(message, userId) {
  const reaction = message.reactions.cache.get('✅');
  if (!reaction) return false;

  const users = await reaction.users.fetch();
  return users.has(userId);
}

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'reinvites_link') return;

    await interaction.deferReply({ ephemeral: true });

    try {
      const link = loadReinvitesLink();

      if (!link) {
        return interaction.editReply('No re-invites link has been set yet.');
      }

      const messageId = loadStartupMessageId();

      if (!messageId) {
        return interaction.editReply('Startup message not found yet.');
      }

      const message = await interaction.channel.messages.fetch(messageId);

      const reacted = await userReactedWithCheck(message, interaction.user.id);

      if (!reacted) {
        return interaction.editReply(
          `You need to react to the startup message first: ${message.url}`
        );
      }

      return interaction.editReply(`**Re-invites Link:** ${link}`);
    } catch (err) {
      console.error('Reinvites handler error:', err);

      return interaction.editReply(
        'An error occurred. The startup message might not be available yet.'
      ).catch(() => {});
    }
  }
};
