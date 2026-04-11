// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const unbelievaboatAPI = require('../utils/unbelievaboat');

const cache = {
    tickets: new Map(),
    vehicles: new Map()
};

// please make sure these folders exist as these folders are VERY important as it stores all the vehicle data, and ticket data
function ensureFolders() {
    const dirs = [
        path.join(__dirname, '..', 'data'),
        path.join(__dirname, '..', 'data', 'tickets'),
        path.join(__dirname, '..', 'data', 'vehicleData')
    ];

    for (const d of dirs) {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d, { recursive: true });
        }
    }
}

// this part here will 
function ensureFile(userId, type) {
    const folder = type === 'vehicles' ? 'vehicleData' : 'tickets';

    const file = path.join(
        __dirname,
        '..',
        'data',
        folder,
        `${userId}.json`
    );

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([], null, 2));
    }

    return file;
}

function makeEmbed(title, desc) {
    const embed = new EmbedBuilder().setColor('#77DD77');

    if (title) embed.setTitle(title);

    embed.setDescription(desc?.length ? desc : 'No info found.');

    return embed;
}

function pagination(userId, page, maxPages, type) {
    const row = [];

    if (page > 0) {
        row.push(
            new ButtonBuilder()
                .setCustomId(`prev_${type}_${userId}_${page}`)
                .setLabel('Prev')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    if (page < maxPages - 1) {
        row.push(
            new ButtonBuilder()
                .setCustomId(`next_${type}_${userId}_${page}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
        );
    }

    if (!row.length) return null;

    return new ActionRowBuilder().addComponents(row);
}

async function loadUser(userId, type) {
    try {
        const folder = type === 'vehicles' ? 'vehicleData' : 'tickets';

        const file = path.join(
            __dirname,
            '..',
            'data',
            folder,
            `${userId}.json`
        );

        if (!fs.existsSync(file)) return [];

        const raw = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(raw);

        if (type === 'vehicles') {
            if (Array.isArray(data)) return data;
            if (data?.items) return data.items;
        }

        return data;
    } catch (err) {
        console.log('load error:', err.message);
        return [];
    }
}

function vehicleEmbeds(data, page) {
    const perPage = 4;
    const pages = Math.ceil(data.length / perPage);

    if (!data.length) {
        return [
            makeEmbed(
                null,
                'No vehicles have been registered by this user.'
            )
        ];
    }

    const slice = data.slice(page * perPage, page * perPage + perPage);

    return slice.map((v, i) => {
        return new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle(`Vehicle #${page * perPage + i + 1}`)
            .setDescription(
                `**Vehicle:** ${v.year} ${v.make} ${v.model}\n` +
                `**Color:** ${v.color}\n` +
                `**Plate:** ${v.numberPlate || v.licensePlate || 'N/A'}`
            )
            .setFooter({ text: `Page ${page + 1}/${pages}` });
    });
}

function ticketEmbeds(data, page) {
    const perPage = 4;
    const pages = Math.ceil((data?.length || 0) / perPage);

    if (!Array.isArray(data) || !data.length) {
        return [makeEmbed(null, 'No tickets found for this user.')];
    }

    const slice = data.slice(page * perPage, page * perPage + perPage);

    return slice.map((t, i) => {
        const date = t.date ? new Date(t.date).toLocaleString() : 'Unknown';
        const fine = Number(t.price || t.fine || 0);

        return new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle(`Ticket #${page * perPage + i + 1}`)
            .addFields(
                { name: 'Offense', value: t.offense || t.reason || 'Unknown' },
                { name: 'Fine', value: `$${fine.toLocaleString()}` },
                { name: 'Date', value: date },
                {
                    name: 'Officer',
                    value: t.issuedBy ? `<@${t.issuedBy}>` : 'Unknown'
                }
            )
            .setFooter({ text: `Page ${page + 1}/${pages}` });
    });
}

module.exports = {
    name: Events.InteractionCreate,
    cache,

    async execute(interaction) {
        if (!interaction.isButton()) return;

        const id = interaction.customId;

        if (
            !id.startsWith('show_') &&
            !id.includes('_registration_') &&
            !id.includes('_ticket_') &&
            !id.startsWith('show_balance_')
        ) return;

        try {
            const parts = id.split('_');
            const userId = parts[2];

            // balance
            if (id.startsWith('show_balance_')) {
                await interaction.deferReply({ ephemeral: true });

                const guildId = interaction.guild?.id;
                if (!guildId) return;

                const bal = await unbelievaboatAPI.getBalance(guildId, userId);

                if (bal?.error) {
                    return interaction.editReply('Failed to get balance.');
                }

                const embed = new EmbedBuilder()
                    .setColor('#77DD77')
                    .setTitle('Balance')
                    .addFields(
                        { name: 'Wallet', value: `$${bal.wallet}` },
                        { name: 'Bank', value: `$${bal.bank}` },
                        { name: 'Total', value: `$${bal.total}` }
                    );

                return interaction.editReply({ embeds: [embed] });
            }

            if (id.startsWith('show_registrations_')) {
                const data = await loadUser(userId, 'vehicles');
                const pages = Math.ceil(data.length / 4);

                return interaction.reply({
                    embeds: vehicleEmbeds(data, 0),
                    components: pages > 1 ? [pagination(userId, 0, pages, 'registration')] : [],
                    ephemeral: true
                });
            }

            if (id.startsWith('show_tickets_')) {
                const data = await loadUser(userId, 'tickets');
                const pages = Math.ceil(data.length / 4);

                return interaction.reply({
                    embeds: ticketEmbeds(data, 0),
                    components: pages > 1 ? [pagination(userId, 0, pages, 'ticket')] : [],
                    ephemeral: true
                });
            }

            if (id.includes('_registration_') || id.includes('_ticket_')) {
                const page = parseInt(parts[3]);
                const next = id.startsWith('next');
                const newPage = next ? page + 1 : page - 1;

                await interaction.deferUpdate();

                if (id.includes('_registration_')) {
                    const data = await loadUser(userId, 'vehicles');

                    return interaction.editReply({
                        embeds: vehicleEmbeds(data, newPage),
                        components: [
                            pagination(userId, newPage, Math.ceil(data.length / 4), 'registration')
                        ]
                    });
                }

                const data = await loadUser(userId, 'tickets');

                return interaction.editReply({
                    embeds: ticketEmbeds(data, newPage),
                    components: [
                        pagination(userId, newPage, Math.ceil(data.length / 4), 'ticket')
                    ]
                });
            }

        } catch (err) {
            console.log('interaction error:', err.message);

            if (!interaction.replied) {
                interaction.reply({
                    content: 'An error occurred while processing this interaction.',
                    ephemeral: true
                });
            }
        }
    }
};
