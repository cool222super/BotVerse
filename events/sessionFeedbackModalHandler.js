


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D




const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isModalSubmit() || interaction.customId !== 'session_feedback_modal') return;

        try {
         
            if (!interaction.isRepliable()) return;

            const host = interaction.fields.getTextInputValue('host');
            const rating = interaction.fields.getTextInputValue('rating');
            const improvement = interaction.fields.getTextInputValue('improvement');
            const notes = interaction.fields.getTextInputValue('notes') || 'No additional notes provided';

          
            const numRating = parseInt(rating);
            if (isNaN(numRating) || numRating < 1 || numRating > 10) {
                if (interaction.isRepliable()) {
                    await interaction.reply({
                        content: 'Please provide a valid rating between 1 and 10.',
                        ephemeral: true
                    }).catch(() => {});
                }
                return;
            }

          
            const feedbackEmbed = new EmbedBuilder()
                .setTitle('**Session Feedback Received**')
                .setDescription(`Feedback from ${interaction.user}`)
                .addFields(
                    { name: 'Host', value: host, inline: true },
                    { name: 'Rating', value: `${rating}/10`, inline: true },
                    { name: 'Improvements Suggested', value: improvement },
                    { name: 'Additional Notes', value: notes }
                )
                .setColor('#77DD77')
                .setTimestamp();

           
            const feedbackChannelId = '1355829280696696943';
            const feedbackChannel = await interaction.client.channels.fetch(feedbackChannelId);
            
            if (feedbackChannel) {
                await feedbackChannel.send({ embeds: [feedbackEmbed] });
                
               
                if (interaction.isRepliable()) {
                    await interaction.reply({
                        content: 'Thank you for your feedback!',
                        ephemeral: true
                    }).catch(() => {});
                }
            }

        } catch (error) {
            
            if (error.code === 10062) {
                console.log('Interaction expired, ignoring.');
                return;
            }

            console.error('Error handling feedback modal submission:', error);
            
          
            if (!interaction.replied && interaction.isRepliable()) {
                try {
                    await interaction.reply({
                        content: 'There was an error submitting your feedback. Please try again.',
                        ephemeral: true
                    }).catch(() => {});
                } catch (err) {
                 
                    if (err.code !== 10062) {
                        console.error('Error sending error response:', err);
                    }
                }
            }
        }
    },
};

