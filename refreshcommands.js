


// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// This command is also not finished!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const fs = require('fs');

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
            const staffRoleId = '1279932257972260926';
            if (!interaction.member.roles.cache.has(staffRoleId)) {
                return await interaction.reply({
                    content: 'You do not have permission to use this command.',
                    ephemeral: true
                });
            }

            const selectedUser = interaction.options.getUser('user');
            const newStatus = interaction.options.getString('status');
            const userId = selectedUser.id;

            if (!fs.existsSync(licensesDirPath)) {
                fs.mkdirSync(licensesDirPath, { recursive: true });
            }

            const licenseFilePath = path.join(licensesDirPath, `${userId}.json`);
            
            let licenses = [];
            if (fs.existsSync(licenseFilePath)) {
                licenses = JSON.parse(fs.readFileSync(licenseFilePath, 'utf8'));
            }

            const newLicense = {
                status: newStatus,
                date: new Date().toISOString(),
                updatedBy: interaction.user.tag
            };
            licenses.push(newLicense);

            fs.writeFileSync(licenseFilePath, JSON.stringify(licenses, null, 2));

            const embed = new EmbedBuilder()
                .setTitle('License Status Updated')
                .setDescription(`
                    **User:** ${selectedUser}
                    **New Status:** ${newStatus}
                    **Updated By:** ${interaction.user}
                    **Date:** ${new Date().toLocaleString()}
                `)
                .setColor('#77DD77')
                .setTimestamp();

            await interaction.reply({
                embeds: [embed]
            });

        } catch (error) {
            console.error('Error in licensestatus command:', error);
            await interaction.reply({
                content: 'An error occurred while updating the license status.',
                ephemeral: true
            });
        }
    }
};