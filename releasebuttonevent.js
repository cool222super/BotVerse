

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/reinvites.json');
const STARTUP_FILE = path.join(__dirname, '../data/startup.json');

function loadReinvitesLink() {
    try {
        if (fs.existsSync(DATA_PATH)) {
            const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
            global.reinviteLink = data.link;
        }
    } catch (error) {
        console.error('Error loading reinvites link:', error);
    }
}

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

loadReinvitesLink();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'reinvites_link') return;

        try {
            try {
                const startupData = JSON.parse(fs.readFileSync(STARTUP_FILE, 'utf-8'));
                const startupMessage = await interaction.channel.messages.fetch(startupData.messageId);
                
                const reaction = startupMessage.reactions.cache.get('✅');
                if (!reaction) {
                    return await interaction.reply({
                        content: `Please react to the startup message to have access to the reinvites link. React [here](${startupMessage.url}).`,
                        ephemeral: true
                    });
                }

                const userReacted = await reaction.users.fetch().then(users => users.has(interaction.user.id));
                if (!userReacted) {
                    return await interaction.reply({
                        content: `Please react to the startup message to have access to the reinvites link. React [here](${startupMessage.url}).`,
                        ephemeral: true
                    });
                }

                if (!global.reinviteLink) {
                    return await interaction.reply({ 
                        content: 'No re-invites link has been set yet.',
                        ephemeral: true
                    });
                }

                await interaction.reply({ 
                    content: `**Re-invites Link:** ${global.reinviteLink}`,
                    ephemeral: true
                });

            } catch (error) {
                console.error('Error checking startup reaction:', error);
                await interaction.reply({
                    content: 'Please wait for the host to post the startup message.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in reinvites button handler:', error);
            try {
                await interaction.reply({
                    content: 'An error occurred while processing your request.',
                    ephemeral: true
                });
            } catch (e) {
                console.error('Error sending error message:', e);
            }
        }
    }
}
