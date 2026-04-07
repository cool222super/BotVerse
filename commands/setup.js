
// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D


const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configure your server bot settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        
        const embed = new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle('Manage your server bot information')
            .setDescription('Here you will be able to put your staff role, civilian role, all the startup formats, put a registration limit on how many vehicles a person can register, and more!');

        const setupSelect = new StringSelectMenuBuilder()
            .setCustomId('setup_select')
            .setPlaceholder('Select an option to configure...')
            .addOptions([
                { label: 'Staff Role', value: 'staff_role', description: 'Set the staff role for startup commands' },
                { label: 'Civilian Role', value: 'civilian_role', description: 'Set the civilian role for basic commands' },
                { label: 'LEO Role', value: 'leo_role', description: 'Set the law enforcement roles' },
                { label: 'Vehicle Registration Limit', value: 'vehicle_limit', description: 'Set the maximum number of vehicles users can register' },
                { label: 'Startup Embed', value: 'startup_embed', description: 'Configure the startup embed appearance' },
                { label: 'Early Access', value: 'early_access', description: 'Configure early access settings and embed' },
                { label: 'Release', value: 'release', description: 'Configure release settings and embed' },
                { label: 'Reinvites', value: 'reinvites', description: 'Configure reinvites settings and embed' },
                { label: 'Over', value: 'over', description: 'Configure session over embed appearance' }
            ]);

        const row = new ActionRowBuilder().addComponents(setupSelect);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false
        });
    },


    async handleSetupSelect(interaction) {
        const selectedOption = interaction.values[0];
        let modalTitle = '';
        let modalId = '';
        
    
        const modal = new ModalBuilder();
        
        if (selectedOption === 'staff_role') {
            modalTitle = 'Staff Role Configuration';
            modalId = 'setup_modal_staff';
            
            const staffRoleInput = new TextInputBuilder()
                .setCustomId('role_id')
                .setLabel('Enter Staff Role ID')
                .setPlaceholder('Example: 1355831451094089918')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(new ActionRowBuilder().addComponents(staffRoleInput));
                
        } else if (selectedOption === 'civilian_role') {
            modalTitle = 'Civilian Role Configuration';
            modalId = 'setup_modal_civilian';
            
            const civilianRoleInput = new TextInputBuilder()
                .setCustomId('role_id')
                .setLabel('Enter Civilian Role ID')
                .setPlaceholder('Example: 1355831451094089918')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(new ActionRowBuilder().addComponents(civilianRoleInput));
                
        } else if (selectedOption === 'leo_role') {
            modalTitle = 'Law Enforcement Role Configuration';
            modalId = 'setup_modal_leo';
            
            const leoRolesInput = new TextInputBuilder()
                .setCustomId('leo_role_ids')
                .setLabel('Enter LEO Role IDs')
                .setPlaceholder('Enter role IDs separated by commas (e.g., 123456789,987654321)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(new ActionRowBuilder().addComponents(leoRolesInput));
                
        } else if (selectedOption === 'vehicle_limit') {
            modalTitle = 'Vehicle Registration Limit';
            modalId = 'setup_modal_vehicle_limit';
            
            const limitInput = new TextInputBuilder()
                .setCustomId('limit_value')
                .setLabel('Maximum vehicles per user')
                .setPlaceholder('Example: 3')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(new ActionRowBuilder().addComponents(limitInput));
        } else if (selectedOption === 'startup_embed') {
            modalTitle = 'Startup Embed Configuration';
            modalId = 'setup_modal_startup_embed';
            
            const titleInput = new TextInputBuilder()
                .setCustomId('embed_title')
                .setLabel('Embed Title')
                .setPlaceholder('Example: Server Startup')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const descriptionInput = new TextInputBuilder()
                .setCustomId('embed_description')
                .setLabel('Description')
                .setPlaceholder('Enter the description for your startup embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
                
            const imageInput = new TextInputBuilder()
                .setCustomId('embed_image')
                .setLabel('Image URL (Optional)')
                .setPlaceholder('Example: https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(imageInput)
                );
        } else if (selectedOption === 'early_access') {
            modalTitle = 'Early Access Configuration';
            modalId = 'setup_modal_early_access';
            
            const pingRolesInput = new TextInputBuilder()
                .setCustomId('ea_ping_roles')
                .setLabel('Who EA will ping')
                .setPlaceholder('Enter role IDs separated by commas (e.g., 123456789,987654321)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const allowedRolesInput = new TextInputBuilder()
                .setCustomId('ea_allowed_roles')
                .setLabel('Who can use the EA button')
                .setPlaceholder('Enter role IDs separated by commas (e.g., 123456789,987654321)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const titleInput = new TextInputBuilder()
                .setCustomId('ea_embed_title')
                .setLabel('Embed Title')
                .setPlaceholder('Example: Early Access Now Available!')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const descriptionInput = new TextInputBuilder()
                .setCustomId('ea_embed_description')
                .setLabel('Embed Description')
                .setPlaceholder('Enter the description for your early access embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
                
            const imageInput = new TextInputBuilder()
                .setCustomId('ea_embed_image')
                .setLabel('Image URL (Optional)')
                .setPlaceholder('Example: https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(
                    new ActionRowBuilder().addComponents(pingRolesInput),
                    new ActionRowBuilder().addComponents(allowedRolesInput),
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(imageInput)
                );
        } else if (selectedOption === 'release') {
            modalTitle = 'Release Configuration';
            modalId = 'setup_modal_release';
            
            const titleInput = new TextInputBuilder()
                .setCustomId('release_embed_title')
                .setLabel('Embed Title')
                .setPlaceholder('Example: Server Now Open to Everyone!')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const descriptionInput = new TextInputBuilder()
                .setCustomId('release_embed_description')
                .setLabel('Embed Description')
                .setPlaceholder('Enter the description for your release embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
                
            const imageInput = new TextInputBuilder()
                .setCustomId('release_embed_image')
                .setLabel('Image URL (Optional)')
                .setPlaceholder('Example: https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(imageInput)
                );
        } else if (selectedOption === 'reinvites') {
            modalTitle = 'Reinvites Configuration';
            modalId = 'setup_modal_reinvites';
            
            const titleInput = new TextInputBuilder()
                .setCustomId('reinvites_embed_title')
                .setLabel('Embed Title')
                .setPlaceholder('Example: Server Reinvites Available!')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const descriptionInput = new TextInputBuilder()
                .setCustomId('reinvites_embed_description')
                .setLabel('Embed Description')
                .setPlaceholder('Enter the description for your reinvites embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
                
            const imageInput = new TextInputBuilder()
                .setCustomId('reinvites_embed_image')
                .setLabel('Image URL (Optional)')
                .setPlaceholder('Example: https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(imageInput)
                );
        } else if (selectedOption === 'over') {
            modalTitle = 'Session Over Configuration';
            modalId = 'setup_modal_over';
            
            const titleInput = new TextInputBuilder()
                .setCustomId('over_embed_title')
                .setLabel('Embed Title')
                .setPlaceholder('Example: Session is now over!')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
                
            const descriptionInput = new TextInputBuilder()
                .setCustomId('over_embed_description')
                .setLabel('Embed Description')
                .setPlaceholder('Enter the description for your session over embed')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
                
            const imageInput = new TextInputBuilder()
                .setCustomId('over_embed_image')
                .setLabel('Image URL (Optional)')
                .setPlaceholder('Example: https://example.com/image.png')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);
                
            modal.setCustomId(modalId)
                .setTitle(modalTitle)
                .addComponents(
                    new ActionRowBuilder().addComponents(titleInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(imageInput)
                );
        }

       
        await interaction.showModal(modal);
    },

    
    async handleModalSubmit(interaction) {
        try {
            const serverId = interaction.guild.id;
            const modalId = interaction.customId;
            console.log(`Processing modal submission: ${modalId}`);
           
            let modalType = '';
            if (modalId.includes('staff')) modalType = 'staff';
            else if (modalId.includes('civilian')) modalType = 'civilian';
            else if (modalId.includes('leo')) modalType = 'leo';
            else if (modalId.includes('vehicle_limit')) modalType = 'vehicle_limit';
            else if (modalId.includes('startup_embed')) modalType = 'startup_embed';
            else if (modalId.includes('early_access')) modalType = 'early_access';
            else if (modalId.includes('release')) modalType = 'release';
            else if (modalId.includes('reinvites')) modalType = 'reinvites';
            else if (modalId.includes('over')) modalType = 'over';
            
            console.log(`Detected modal type: ${modalType}`);
            
          
            const dataDir = path.join(process.cwd(), 'data', 'serverConfig');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

          
            const configFilePath = path.join(dataDir, `${serverId}.json`);
            console.log(`Config file path: ${configFilePath}`);

            let existingConfig = {};

          
            if (fs.existsSync(configFilePath)) {
                const fileContent = fs.readFileSync(configFilePath, 'utf8');
                console.log(`Existing config file content: ${fileContent}`);
                try {
                    existingConfig = JSON.parse(fileContent);
                } catch (e) {
                    console.error(`Error parsing JSON for server ${serverId}:`, e);
                  
                }
            } else {
                console.log(`No existing config file found for server ${serverId}`);
            }

            let successMessage = '';
            let alreadyWritten = false;

         
            if (modalType === 'staff') {
                const roleId = interaction.fields.getTextInputValue('role_id');
                existingConfig.staffRole = roleId;
                successMessage = 'Staff role has been set successfully! This role can now use all startup commands.';
            } 
            else if (modalType === 'civilian') {
                const roleId = interaction.fields.getTextInputValue('role_id');
                existingConfig.civilianRole = roleId;
                successMessage = 'Civilian role has been set successfully! This role can now use basic commands like profile, register, etc.';
            }
            else if (modalType === 'leo') {
                console.log('Processing LEO roles form submission');
                
                const leoRoles = interaction.fields.getTextInputValue('leo_role_ids');
                console.log(`LEO roles: "${leoRoles}"`);
                
                
                const leoRoleIds = leoRoles.split(',').map(id => id.trim()).filter(id => id.length > 0);
                
             
                existingConfig.leoRoles = leoRoleIds;
                
              
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
                
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                   
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Law Enforcement roles have been configured successfully!';
            }
            else if (modalType === 'vehicle_limit') {
                console.log('Processing vehicle limit form submission');
                
                const limitValue = interaction.fields.getTextInputValue('limit_value');
                console.log(`Raw limit value from form: "${limitValue}"`);
                
                const limit = parseInt(limitValue, 10);
                console.log(`Parsed limit: ${limit}, type: ${typeof limit}`);
                
                if (isNaN(limit) || limit < 1) {
                    console.log('Invalid limit value detected');
                    await interaction.reply({
                        content: 'Please enter a valid number greater than 0 for the vehicle limit.',
                        ephemeral: true
                    });
                    return;
                }
                
               
                existingConfig.vehicleLimit = limit;
                console.log(`Set vehicleLimit in config object: ${existingConfig.vehicleLimit}, type: ${typeof existingConfig.vehicleLimit}`);
                
               
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
                
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                   
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                        
                        try {
                            const parsedConfig = JSON.parse(verifyData);
                            console.log(`Parsed config from file - vehicleLimit: ${parsedConfig.vehicleLimit}, type: ${typeof parsedConfig.vehicleLimit}`);
                        } catch (e) {
                            console.error('Error parsing verification data:', e);
                        }
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                
                alreadyWritten = true;
                
                successMessage = `Vehicle registration limit has been set to ${limit} vehicles per user.`;
            }
            else if (modalType === 'startup_embed') {
                console.log('Processing startup embed form submission');
                
                const embedTitle = interaction.fields.getTextInputValue('embed_title');
                const embedDescription = interaction.fields.getTextInputValue('embed_description');
                const embedImage = interaction.fields.getTextInputValue('embed_image') || null;
                
                console.log(`Embed title: "${embedTitle}"`);
                console.log(`Embed description: "${embedDescription}"`);
                console.log(`Embed image URL: "${embedImage}"`);
                
            
                if (!existingConfig.startupEmbed) {
                    existingConfig.startupEmbed = {};
                }
                
                existingConfig.startupEmbed.title = embedTitle;
                existingConfig.startupEmbed.description = embedDescription;
                existingConfig.startupEmbed.imageUrl = embedImage;
                
               
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
                
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                  
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Startup embed has been configured successfully!';
            }
            else if (modalType === 'early_access') {
                console.log('Processing early access form submission');
                
                const pingRoles = interaction.fields.getTextInputValue('ea_ping_roles');
                const allowedRoles = interaction.fields.getTextInputValue('ea_allowed_roles');
                const embedTitle = interaction.fields.getTextInputValue('ea_embed_title');
                const embedDescription = interaction.fields.getTextInputValue('ea_embed_description');
                const embedImage = interaction.fields.getTextInputValue('ea_embed_image') || null;
                
                console.log(`EA ping roles: "${pingRoles}"`);
                console.log(`EA allowed roles: "${allowedRoles}"`);
                console.log(`EA embed title: "${embedTitle}"`);
                console.log(`EA embed description: "${embedDescription}"`);
                console.log(`EA embed image URL: "${embedImage}"`);
                
                
                const pingRoleIds = pingRoles.split(',').map(id => id.trim()).filter(id => id.length > 0);
                
                
                const allowedRoleIds = allowedRoles.split(',').map(id => id.trim()).filter(id => id.length > 0);
                
             
                if (!existingConfig.earlyAccess) {
                    existingConfig.earlyAccess = {};
                }
                
                existingConfig.earlyAccess.pingRoles = pingRoleIds;
                existingConfig.earlyAccess.allowedRoles = allowedRoleIds;
                existingConfig.earlyAccess.embedTitle = embedTitle;
                existingConfig.earlyAccess.embedDescription = embedDescription;
                existingConfig.earlyAccess.imageUrl = embedImage;
                
               
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
               
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                    
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Early Access settings have been configured successfully!';
            }
            else if (modalType === 'release') {
                console.log('Processing release form submission');
                
                const embedTitle = interaction.fields.getTextInputValue('release_embed_title');
                const embedDescription = interaction.fields.getTextInputValue('release_embed_description');
                const embedImage = interaction.fields.getTextInputValue('release_embed_image') || null;
                
                console.log(`Release embed title: "${embedTitle}"`);
                console.log(`Release embed description: "${embedDescription}"`);
                console.log(`Release embed image URL: "${embedImage}"`);
                
               
                if (!existingConfig.release) {
                    existingConfig.release = {};
                }
                
                existingConfig.release.embedTitle = embedTitle;
                existingConfig.release.embedDescription = embedDescription;
                existingConfig.release.imageUrl = embedImage;
                
               
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
                
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                   
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Release settings have been configured successfully!';
            }
            else if (modalType === 'reinvites') {
                console.log('Processing reinvites form submission');
                
                const embedTitle = interaction.fields.getTextInputValue('reinvites_embed_title');
                const embedDescription = interaction.fields.getTextInputValue('reinvites_embed_description');
                const embedImage = interaction.fields.getTextInputValue('reinvites_embed_image') || null;
                
                console.log(`Reinvites embed title: "${embedTitle}"`);
                console.log(`Reinvites embed description: "${embedDescription}"`);
                console.log(`Reinvites embed image URL: "${embedImage}"`);
                
              
                if (!existingConfig.reinvites) {
                    existingConfig.reinvites = {};
                }
                
                existingConfig.reinvites.embedTitle = embedTitle;
                existingConfig.reinvites.embedDescription = embedDescription;
                existingConfig.reinvites.imageUrl = embedImage;
                
                
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
               
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                    
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Reinvites settings have been configured successfully!';
            }
            else if (modalType === 'over') {
                console.log('Processing over form submission');
                
                const embedTitle = interaction.fields.getTextInputValue('over_embed_title');
                const embedDescription = interaction.fields.getTextInputValue('over_embed_description');
                const embedImage = interaction.fields.getTextInputValue('over_embed_image') || null;
                
                console.log(`Over embed title: "${embedTitle}"`);
                console.log(`Over embed description: "${embedDescription}"`);
                console.log(`Over embed image URL: "${embedImage}"`);
                
                
                if (!existingConfig.over) {
                    existingConfig.over = {};
                }
                
                existingConfig.over.embedTitle = embedTitle;
                existingConfig.over.embedDescription = embedDescription;
                existingConfig.over.imageUrl = embedImage;
                
            
                console.log('Full config object before saving:', JSON.stringify(existingConfig, null, 2));
                
                
                try {
                    fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
                    console.log(`Config file written to: ${configFilePath}`);
                    
                
                    if (fs.existsSync(configFilePath)) {
                        const verifyData = fs.readFileSync(configFilePath, 'utf8');
                        console.log(`Verification - saved config data: ${verifyData}`);
                    } else {
                        console.error('Config file does not exist after writing!');
                    }
                } catch (writeError) {
                    console.error('Error writing config file:', writeError);
                }
                
                alreadyWritten = true;
                
                successMessage = 'Session Over embed has been configured successfully!';
            }

        
            if (!alreadyWritten) {
                fs.writeFileSync(configFilePath, JSON.stringify(existingConfig, null, 2), 'utf8');
            }

           
            if (!successMessage) {
                successMessage = 'Configuration has been updated successfully.';
            }

            
            await interaction.reply({ 
                content: successMessage, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error in setup command:', error);
            await interaction.reply({ 
                content: 'An error occurred while saving configuration. Please try again later.', 
                ephemeral: true 
            });
        }
    },
};
