// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D


const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits,
} = require('discord.js');

const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleset')
        .setDescription('Set roles for this server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId('role_select')
            .setPlaceholder('Pick a role to set')
            .addOptions([
                {
                    label: 'Civilian',
                    value: 'civilian',
                    description: 'Basic user role'
                },
                {
                    label: 'Staff',
                    value: 'staff',
                    description: 'Staff team role'
                },
                {
                    label: 'LEO',
                    value: 'leo',
                    description: 'Law enforcement role'
                },
            ]);

        await interaction.reply({
            content: 'Choose a role type:',
            components: [new ActionRowBuilder().addComponents(menu)],
            ephemeral: true,
        });
    },

    async handleRoleSelect(interaction) {
        const type = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`role_modal_${type}`)
            .setTitle(`Set ${type} role`);

        const input = new TextInputBuilder()
            .setCustomId('role_id')
            .setLabel('Role ID')
            .setPlaceholder('Copy role ID from Discord')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(input)
        );

        await interaction.showModal(modal);
    },

    async handleModalSubmit(interaction) {
        try {
            if (!interaction.guild) {
                return interaction.reply({
                    content: 'This only works inside a server.',
                    ephemeral: true
                });
            }

            const type = interaction.customId.replace('role_modal_', '');
            const roleId = interaction.fields.getTextInputValue('role_id');

            const dir = path.join(process.cwd(), 'data', 'roles');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            const file = path.join(dir, `${interaction.guild.id}.json`);

            let config = {};
            if (fs.existsSync(file)) {
                try {
                    config = JSON.parse(fs.readFileSync(file, 'utf8'));
                } catch (e) {
                    console.log('There is a bad config file, resetting it...');
                    config = {};
                }
            }
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) {
                return interaction.reply({
                    content: 'That role does not exist.',
                    ephemeral: true
                });
            }
            if (type === 'staff') config.staffRole = roleId;
            if (type === 'civilian') config.civilianRole = roleId;
            if (type === 'leo') config.leoRoles = [roleId];

            fs.writeFileSync(file, JSON.stringify(config, null, 2));

            await interaction.reply({
                content: `${type} role has been set.`,
                ephemeral: true
            });

        } catch (err) {
            console.error(err);

            if (!interaction.replied) {
                await interaction.reply({
                    content: 'An error occurred while saving the role.',
                    ephemeral: true
                });
            }
        }
    },
};
