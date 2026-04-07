


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D




const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const startupFile = path.join(__dirname, '../data/startup.json');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'sfrr';

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('session_link_')) return;

    try {
      await interaction.deferReply({ ephemeral: true });


      try {
        let startupData;
        if (MONGODB_URI) {
          const client = new MongoClient(MONGODB_URI);
          try {
            await client.connect();
            const db = client.db(DB_NAME);
            const collection = db.collection('startup');
            
            startupData = await collection.findOne({ type: 'startup' });
            await client.close();
          } catch (mongoError) {
            console.error('MongoDB Error:', mongoError);
            startupData = JSON.parse(fs.readFileSync(startupFile, 'utf-8'));
          }
        } else {
         
          startupData = JSON.parse(fs.readFileSync(startupFile, 'utf-8'));
        }
        const startupMessage = await interaction.channel.messages.fetch(startupData.messageId);
        
        const reaction = startupMessage.reactions.cache.get('✅');
        if (!reaction) {
          await interaction.editReply({
            content: `Please react to the startup message to have access to the session link. React [here](${startupMessage.url}).`
          });
          return;
        }

        const userReacted = await reaction.users.fetch().then(users => users.has(interaction.user.id));
        if (!userReacted) {
          await interaction.editReply({
            content: `Please react to the startup message to have access to the session link. React [here](${startupMessage.url}).`
          });
          return;
        }

        const link = interaction.customId.replace('session_link_', '');
        await interaction.editReply({
          content: `**Session Link:** ${link}`
        });

      } catch (error) {
        console.error('Error checking startup reaction:', error);
        await interaction.editReply({
          content: 'Please wait for the host to post the startup message.'
        });
      }

    } catch (error) {
      console.error('Error in session link button handler:', error);
      try {
        await interaction.editReply({
          content: 'An error occurred while processing your request. Please try again later.'
        });
      } catch (e) {
        console.error('Failed to send error message:', e);
      }
    }
  }
};
