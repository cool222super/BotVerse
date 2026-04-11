// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const startupFile = path.join(__dirname, '../data/startup.json');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'sfrr';

async function getStartupData() {
  const fallback = JSON.parse(fs.readFileSync(startupFile, 'utf8'));

  if (!MONGODB_URI) return fallback;

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection('startup');

    const data = await collection.findOne({ type: 'startup' });

    return data || fallback;
  } catch (err) {
    console.error('MongoDB error, falling back to file:', err);
    return fallback;
  } finally {
    await client.close().catch(() => {});
  }
}

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('session_link_')) return;

    await interaction.deferReply({ ephemeral: true });

    try {
      const startupData = await getStartupData();

      const msg = await interaction.channel.messages.fetch(startupData.messageId);

      const reaction = msg.reactions.cache.get('✅');

      if (!reaction) {
        return interaction.editReply(
          `You need to react to the startup message first: ${msg.url}`
        );
      }

      const users = await reaction.users.fetch();
      const hasReacted = users.has(interaction.user.id);

      if (!hasReacted) {
        return interaction.editReply(
          `You need to react to the startup message first: ${msg.url}`
        );
      }

      const link = interaction.customId.replace('session_link_', '');

      return interaction.editReply(`**Session Link:** ${link}`);
    } catch (err) {
      console.error('Session link handler error:', err);

      return interaction.editReply(
        'An error occurred. The startup message might not be available yet.'
      ).catch(() => {});
    }
  },
};
