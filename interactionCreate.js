


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'get_session_link') {
            const filePath = path.join(__dirname, '../data/sessionLink.json');

            try {
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, '{}', 'utf8');
                }

                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                if (!data.link) {
                    return interaction.reply({ content: 'No active session link found.', ephemeral: true });
                }

                await interaction.reply({ content: `**Session Link:** ${data.link}`, ephemeral: true });
            } catch (error) {
                console.error('Error reading session link file:', error);
                await interaction.reply({ content: 'An error occurred while retrieving the session link.', ephemeral: true });
            }
        }
    }
};
