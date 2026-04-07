
// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D


const { Events } = require('discord.js');
const setupCommand = require('../commands/utility/setup');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
         
            if (!(
                (interaction.isStringSelectMenu() && interaction.customId === 'setup_select') ||
                (interaction.isModalSubmit() && interaction.customId.startsWith('setup_modal_'))
            )) {
                return;
            }

        
            if (!interaction.isRepliable()) {
                console.log('Interaction is no longer repliable, ignoring.');
                return;
            }

          
            if (interaction.isStringSelectMenu() && interaction.customId === 'setup_select') {
                await setupCommand.handleSetupSelect(interaction).catch(error => {
                  
                    if (error.code === 10062) { 
                        console.log('Interaction expired, ignoring.');
                        return;
                    }
                    if (error.code === 10064) { 
                        console.log('Message no longer exists, ignoring.');
                        return;
                    }
                    console.error('Error handling setup select menu:', error);
                });
            }

           
            if (interaction.isModalSubmit() && interaction.customId.startsWith('setup_modal_')) {
                await setupCommand.handleModalSubmit(interaction).catch(error => {
                    
                    if (error.code === 10062) { 
                        console.log('Interaction expired, ignoring.');
                        return;
                    }
                    if (error.code === 10064) { 
                        console.log('Message no longer exists, ignoring.');
                        return;
                    }
                    console.error('Error handling setup modal submit:', error);
                });
            }
        } catch (error) {
           
            if (error.code === 10062 || error.code === 10064) {
                console.log(`Ignored error ${error.code}`);
                return;
            }

            console.error('Error in setup handler:', error);
            
           
            if (!interaction.replied && interaction.isRepliable()) {
                try {
                    await interaction.reply({
                        content: 'There was an error processing your request. Please try again.',
                        ephemeral: true
                    }).catch(() => {});
                } catch (err) {
                    
                    console.error('Failed to send error message:', err);
                }
            }
        }
    },
};
