


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D


const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
          
            if (!interaction.isButton()) return;
            if (interaction.customId !== 'session_feedback') return;
            
            if (!interaction.isRepliable() || interaction.replied) return;

            const modal = new ModalBuilder()
                .setCustomId('session_feedback_modal')
                .setTitle('Session Feedback');
           
            const hostInput = new TextInputBuilder()
                .setCustomId('host')
                .setLabel('Who was the host?')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(100)
                .setPlaceholder('Enter the host\'s name')
                .setRequired(true);

       
            const ratingInput = new TextInputBuilder()
                .setCustomId('rating')
                .setLabel('Session Rating (1-10)')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(2)
                .setPlaceholder('Enter a number between 1 and 10')
                .setRequired(true);

           
            const improvementInput = new TextInputBuilder()
                .setCustomId('improvement')
                .setLabel('What can we improve?')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(1)
                .setMaxLength(1000)
                .setPlaceholder('Make the server have less FRP and must have 2+ characters')
                .setRequired(true);

            const notesInput = new TextInputBuilder()
                .setCustomId('notes')
                .setLabel('Additional Notes (Optional)')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(1)
                .setMaxLength(1000)
                .setRequired(false);

            const hostRow = new ActionRowBuilder().addComponents(hostInput);
            const firstRow = new ActionRowBuilder().addComponents(ratingInput);
            const secondRow = new ActionRowBuilder().addComponents(improvementInput);
            const thirdRow = new ActionRowBuilder().addComponents(notesInput);

            modal.addComponents(hostRow, firstRow, secondRow, thirdRow);

            await interaction.showModal(modal).catch(async (error) => {
                if (error.code === 10062) { 
                    console.log('Interaction expired, ignoring.');
                    return;
                }
                if (error.code === 1008) { 
                    console.log('WebSocket connection issue, ignoring.');
                    return;
                }
                console.error('Error showing modal:', error);
            });

        } catch (error) {
            if (error.code === 10062 || error.code === 1008) {
                console.log(`Ignored error ${error.code}`);
                return;
            }

            console.error('Error in session feedback handler:', error);
            if (!interaction.replied && interaction.isRepliable()) {
                try {
                    await interaction.reply({
                        content: 'There was an error opening the feedback form. Please try again.',
                        ephemeral: true
                    }).catch(() => {});
                } catch (err) {
                    console.error('Failed to send error message:', err);
                }
            }
        }
    },
};

