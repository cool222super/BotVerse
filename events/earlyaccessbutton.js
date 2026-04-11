
// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { InteractionType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getServerConfig } = require('../utils/serverConfig');

const LINKS_FILE = path.join(__dirname, '..', 'data', 'earlyAccessLinks.json');
const STARTUP_FILE = path.join(__dirname, '..', 'data', 'startup.json');

function loadLinks() {
  try {
    if (!fs.existsSync(LINKS_FILE)) return {};
    return JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to load early access links:', err);
    return {};
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

async function userReacted(message, userId) {
  const reaction = message.reactions.cache.get('✅');
  if (!reaction) return false;

  const users = await reaction.users.fetch();
  return users.has(userId);
}

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'early_access_link') return;

    await interaction.deferReply({ ephemeral: true });

    try {
      const serverConfig = getServerConfig(interaction.guild.id);

      const allowedRoles = serverConfig?.earlyAccess?.allowedRoles;

      if (!allowedRoles || !allowedRoles.length) {
        return interaction.editReply(
          "Early access isn't set up yet. Ask an admin to configure it using /setup."
        );
      }

      const hasRole = interaction.member.roles.cache.some(role =>
        allowedRoles.includes(role.id)
      );

      if (!hasRole) {
        return interaction.editReply("You don't have permission to use this.");
      }

      const startupMessageId = loadStartupMessageId();

      if (!startupMessageId) {
        return interaction.editReply('Startup message not found yet.');
      }

      const startupMessage = await interaction.channel.messages.fetch(startupMessageId);

      const reacted = await userReacted(startupMessage, interaction.user.id);

      if (!reacted) {
        return interaction.editReply(
          `You need to react to the startup message first: ${startupMessage.url}`
        );
      }

      const links = loadLinks();
      const link = links[interaction.message.id];

      if (!link) {
        return interaction.editReply('This early access link is no longer available.');
      }

      return interaction.editReply(`**Early Access:** ${link}`);

    } catch (err) {
      console.error('Early access handler error:', err);

      return interaction.editReply(
        'An error occurred. The startup message might not be available yet.'
      ).catch(() => {});
    }
  }
};
