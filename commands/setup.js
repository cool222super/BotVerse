

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
                .setPlaceholder('Example: Early Access has been released!')
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
                .setPlaceholder('Example: The session has been released!')
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
                .setPlaceholder('Example: Reinvites has been released!')
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
                .setPlaceholder('Example: The Session is now over!')
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

            let modalType = '';
            if (modalId.includes('staff')) modalType = 'staff';
            else if (modalId.includes('civilian')) modalType = 'civilian';
            else if (modalId.includes('vehicle_limit')) modalType = 'vehicle_limit';
            else if (modalId.includes('leo')) modalType = 'leo';
            else if (modalId.includes('startup_embed')) modalType = 'startup_embed';
            else if (modalId.includes('early_access')) modalType = 'early_access';
            else if (modalId.includes('release')) modalType = 'release';
            else if (modalId.includes('reinvites')) modalType = 'reinvites';
            else if (modalId.includes('over')) modalType = 'over';

            const configDir = path.join(process.cwd(), 'data', 'serverConfig');
            if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

            const configPath = path.join(configDir, `${serverId}.json`);
            let config = {};

            if (fs.existsSync(configPath)) {
                try {
                    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                } catch (e) {
                    console.error(`Failed to parse config for ${serverId}:`, e);
                }
            }

            let msg = '';

            if (modalType === 'staff') {
                config.staffRole = interaction.fields.getTextInputValue('role_id');
                msg = 'Staff role updated.';
            }
            else if (modalType === 'civilian') {
                config.civilianRole = interaction.fields.getTextInputValue('role_id');
                msg = 'Civilian role set.';
            }
            else if (modalType === 'vehicle_limit') {
                const limit = parseInt(interaction.fields.getTextInputValue('limit_value'), 10);
                if (isNaN(limit) || limit < 1) {
                    await interaction.reply({ content: 'You must add a number thats 1 or higher. ', ephemeral: true });
                    return;
                }
                config.vehicleLimit = limit;
                msg = `The Vehicle limit is now ${limit}.`;
            }
            else if (modalType === 'leo') {
                const raw = interaction.fields.getTextInputValue('leo_role_ids');
                config.leoRoles = raw.split(',').map(r => r.trim()).filter(r => r);
                msg = 'The LEO roles has been successfully been saved.';
            }
            else if (modalType === 'startup_embed') {
                if (!config.startupEmbed) config.startupEmbed = {};
                config.startupEmbed.title = interaction.fields.getTextInputValue('embed_title');
                config.startupEmbed.description = interaction.fields.getTextInputValue('embed_description');
                config.startupEmbed.imageUrl = interaction.fields.getTextInputValue('embed_image') || null;
                msg = 'The Startup embed has been updated.';
            }
            else if (modalType === 'early_access') {
                if (!config.earlyAccess) config.earlyAccess = {};
                const pings = interaction.fields.getTextInputValue('ea_ping_roles').split(',').map(r => r.trim()).filter(Boolean);
                const allowed = interaction.fields.getTextInputValue('ea_allowed_roles').split(',').map(r => r.trim()).filter(Boolean);
                config.earlyAccess.pingRoles = pings;
                config.earlyAccess.allowedRoles = allowed;
                config.earlyAccess.embedTitle = interaction.fields.getTextInputValue('ea_embed_title');
                config.earlyAccess.embedDescription = interaction.fields.getTextInputValue('ea_embed_description');
                config.earlyAccess.imageUrl = interaction.fields.getTextInputValue('ea_embed_image') || null;
                msg = 'The Early access settings has been saved.';
            }
            else if (modalType === 'release') {
                if (!config.release) config.release = {};
                config.release.embedTitle = interaction.fields.getTextInputValue('release_embed_title');
                config.release.embedDescription = interaction.fields.getTextInputValue('release_embed_description');
                config.release.imageUrl = interaction.fields.getTextInputValue('release_embed_image') || null;
                msg = 'The Release embed has successfully been saved.';
            }
            else if (modalType === 'reinvites') {
                if (!config.reinvites) config.reinvites = {};
                config.reinvites.embedTitle = interaction.fields.getTextInputValue('reinvites_embed_title');
                config.reinvites.embedDescription = interaction.fields.getTextInputValue('reinvites_embed_description');
                config.reinvites.imageUrl = interaction.fields.getTextInputValue('reinvites_embed_image') || null;
                msg = 'The Reinvites embed has successfully been saved.';
            }
            else if (modalType === 'over') {
                if (!config.over) config.over = {};
                config.over.embedTitle = interaction.fields.getTextInputValue('over_embed_title');
                config.over.embedDescription = interaction.fields.getTextInputValue('over_embed_description');
                config.over.imageUrl = interaction.fields.getTextInputValue('over_embed_image') || null;
                msg = 'The Session over embed has successfully been saved.';
            }

            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
            await interaction.reply({ content: msg || 'Saved.', ephemeral: true });

        } catch (error) {
            console.error('setup modal error:', error);
            await interaction.reply({ content: 'An error occurred while saving the settings. Please try again later!', ephemeral: true });
        }
    },
};
