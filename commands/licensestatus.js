// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const fs = require('fs');
const { getRoleConfig } = require('../../utils/roleCheck');

const licensesDirPath = path.join(__dirname, '../../data/licenses');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('licensestatus')
        .setDescription('Set or view a user\'s license status')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Set the license status')
                .setRequired(true)
                .addChoices(
                    { name: 'Active', value: 'Active' },
                    { name: 'Expired', value: 'Expired' },
                    { name: 'Deactivated', value: 'Deactivated' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        try {
            if (!interaction.guild) {
                return interaction.reply({
                    content: 'This command only works in servers.',
                    ephemeral: true
                });
            }

            const roleConfig = getRoleConfig(interaction.guild.id);

            if (!roleConfig?.leo?.role1) {
                return interaction.reply({
                    content: 'LEO role is not set yet. Please run /roleset first.',
                    ephemeral: true
                });
            }

            const leoRole = roleConfig.leo.role1;

            if (!interaction.member.roles.cache.has(leoRole)) {
                return interaction.reply({
                    content: 'You need the LEO role to use this command.',
                    ephemeral: true
                });
            }

            const user = interaction.options.getUser('user');
            const status = interaction.options.getString('status');

            if (!fs.existsSync(licensesDirPath)) {
                fs.mkdirSync(licensesDirPath, { recursive: true });
            }

            const filePath = path.join(licensesDirPath, `${user.id}.json`);

            let licenses = [];

            if (fs.existsSync(filePath)) {
                try {
                    licenses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                } catch (e) {
                    console.log('There was a broken license file the bot will reset it:', e);
                    licenses = [];
                }
            }

            licenses.push({
                status,
                date: new Date().toISOString(),
                updatedBy: interaction.user.tag
            });

            fs.writeFileSync(filePath, JSON.stringify(licenses, null, 2));

            const embed = new EmbedBuilder()
                .setTitle('License Status Updated')
                .setColor('#77DD77')
                .setDescription(
                    `**User:** ${user}\n` +
                    `**Status:** ${status}\n` +
                    `**Updated By:** ${interaction.user}\n` +
                    `**Date:** ${new Date().toLocaleString()}`
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.log('There was a licensestatus error:', err);

            if (!interaction.replied) {
                return interaction.reply({
                    content: 'An error occurred while updating the license status.',
                    ephemeral: true
                });
            }
        }
    }
};
