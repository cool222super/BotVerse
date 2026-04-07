

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D




const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const path = require('path');
const fs = require('fs');
const unbelievaboatAPI = require('../utils/unbelievaboat');

const userDataCache = {
    tickets: new Map(),
    vehicles: new Map()
};

const ensureDirectories = () => {
    const directories = [
        path.join(__dirname, '..', 'data'),
        path.join(__dirname, '..', 'data', 'tickets'),
        path.join(__dirname, '..', 'data', 'vehicleData')
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
};

const ensureUserDataFile = (userId, dataType) => {
    const dataPath = path.join(
        __dirname, 
        '..', 
        'data', 
        dataType === 'vehicles' ? 'vehicleData' : 'tickets',
        `${userId}.json`
    );

    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify([], null, 2), 'utf8');
        console.log(`Created ${dataType} file for user ${userId}`);
    }
    return dataPath;
};

const createEmbed = (title, description) => {
    const embed = new EmbedBuilder()
        .setColor('#77DD77');
    
    if (title) embed.setTitle(title);
    if (description && description.length > 0) {
        embed.setDescription(description);
    } else {
        embed.setDescription('No information available.');
    }
    
    return embed;
};

const createPaginationButtons = (userId, currentPage, totalPages, type) => {
    const buttons = [];
    

    if (currentPage > 0) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`prev_${type}_${userId}_${currentPage}`)
                .setLabel('Previous')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    

    if (currentPage < totalPages - 1) {
        buttons.push(
            new ButtonBuilder()
                .setCustomId(`next_${type}_${userId}_${currentPage}`)
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
        );
    }
    
   
    return new ActionRowBuilder().addComponents(buttons);
};

const loadUserData = async (userId, dataType) => {
    try {
        const dataPath = path.join(__dirname, '..', 'data', 
            dataType === 'vehicles' ? 'vehicleData' : 'tickets', 
            `${userId}.json`
        );

        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const parsedData = JSON.parse(rawData);
            
            
            if (dataType === 'vehicles') {
                
                if (parsedData.items) {
                    return parsedData.items;
                }
                if (Array.isArray(parsedData)) {
                    return parsedData;
                }
            }
            return parsedData;
        }
        return [];
    } catch (error) {
        console.error(`Error loading ${dataType} data:`, error);
        return [];
    }
};

module.exports = {
    name: Events.InteractionCreate,
    userDataCache,
    async execute(interaction) {
        if (!interaction.isButton()) return;

       
        if (!interaction.customId.startsWith('show_') && 
            !interaction.customId.includes('_registration_') && 
            !interaction.customId.includes('_ticket_') &&
            !interaction.customId.startsWith('_balance_')) {
            return;
        }

        try {
            const parts = interaction.customId.split('_');
            const userId = parts[2];

            if (interaction.customId.startsWith('show_balance_')) {
                await interaction.deferReply({ ephemeral: true });
                
                const guildId = interaction.guild.id;
                const balance = await unbelievaboatAPI.getBalance(guildId, userId);
                
                if (balance.error) {
                    await interaction.editReply({
                        content: 'Unable to fetch balance information at this time. Please try again later.',
                        ephemeral: true
                    });
                    return;
                }

                const balanceEmbed = new EmbedBuilder()
                    .setColor('#77DD77')
                    .setTitle('Balance Information')
                    .addFields(
                        { 
                            name: 'Wallet', 
                            value: `$${balance.wallet.toLocaleString()}`, 
                            inline: true 
                        },
                        { 
                            name: 'Bank', 
                            value: `$${balance.bank.toLocaleString()}`, 
                            inline: true 
                        },
                        {
                            name: 'Total',
                            value: `$${balance.total.toLocaleString()}`,
                            inline: true
                        }
                    )
                    .setTimestamp();

                await interaction.editReply({
                    embeds: [balanceEmbed],
                    ephemeral: true
                });
                return;
            }

            console.log(`Processing button interaction for user ${userId}`);

            if (userDataCache.tickets.has(userId)) userDataCache.tickets.delete(userId);
            if (userDataCache.vehicles.has(userId)) userDataCache.vehicles.delete(userId);

            if (interaction.customId.startsWith('show_')) {
                if (interaction.customId.startsWith('show_registrations_')) {
                    const vehicleData = await loadUserData(userId, 'vehicles');
                    const itemsPerPage = 4; 
                    const totalPages = Math.ceil(vehicleData.length / itemsPerPage);
                    await interaction.reply({
                        embeds: await createVehicleEmbed(vehicleData, 0),
                        components: totalPages > 1 ? [createPaginationButtons(userId, 0, totalPages, 'registration')] : [],
                        ephemeral: true
                    });
                } 
                else if (interaction.customId.startsWith('show_tickets_')) {
                    console.log('Loading tickets for display');
                    const tickets = await loadUserData(userId, 'tickets');
                    console.log(`Found ${tickets.length} tickets`);
                    
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(tickets.length / itemsPerPage);
                    const components = [];
                    const paginationRow = createPaginationButtons(userId, 0, totalPages, 'ticket');
                    if (paginationRow.components.length > 0) {
                        components.push(paginationRow);
                    }

                    await interaction.reply({
                        embeds: await createTicketEmbed(tickets, 0),
                        components: components,
                        ephemeral: true
                    });
                }
            }
            else if (interaction.customId.includes('_registration_') || interaction.customId.includes('_ticket_')) {
                await interaction.deferUpdate();
                const currentPage = parseInt(parts[3]);
                const isNext = interaction.customId.startsWith('next');
                const newPage = isNext ? currentPage + 1 : currentPage - 1;

                if (interaction.customId.includes('_registration_')) {
                    const vehicleData = await loadUserData(userId, 'vehicles');
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(vehicleData.length / itemsPerPage);
                    
                    await interaction.editReply({
                        embeds: await createVehicleEmbed(vehicleData, newPage),
                        components: [createPaginationButtons(
                            userId,
                            newPage,
                            totalPages,
                            'registration'
                        )]
                    });
                } else if (interaction.customId.includes('_ticket_')) {
                    const tickets = await loadUserData(userId, 'tickets');
                    const itemsPerPage = 4;
                    const totalPages = Math.ceil(tickets.length / itemsPerPage);
                    
                    await interaction.editReply({
                        embeds: await createTicketEmbed(tickets, newPage),
                        components: [createPaginationButtons(userId, newPage, totalPages, 'ticket')]
                    });
                }
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            const errorMessage = 'An error occurred while processing your request.';
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: errorMessage,
                    ephemeral: true
                });
            } else {
                await interaction.followUp({
                    content: errorMessage,
                    ephemeral: true
                });
            }
        }
    }
};

async function createVehicleEmbed(vehicleData, page) {
    const itemsPerPage = 4;
    const totalPages = Math.ceil(vehicleData.length / itemsPerPage);
    
    if (vehicleData.length === 0) {
        return [createEmbed(null, 'No vehicle have been registered by this user. If you would like to register a vehicle, please use the </register:1360700061759049789> command.')];
    }

    const pageVehicles = vehicleData.slice(page * itemsPerPage, (page * itemsPerPage) + itemsPerPage);
    
    const embeds = pageVehicles.map((v, index) => {
        return new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle(`Vehicle Registration #${(page * itemsPerPage) + index + 1}`)
            .setDescription(`**Vehicle:** ${v.year} ${v.make} ${v.model}\n**Vehicle Color:** ${v.color}\n**Number Plate:** ${v.numberPlate}`)
            .setFooter({ text: `Page ${page + 1}/${totalPages}` });
    });

    return embeds;
}

async function createTicketEmbed(tickets = [], page = 0) {
    console.log('Creating ticket embed with:', {
        ticketsLength: tickets.length,
        page: page
    });

    const itemsPerPage = 4;
    const totalPages = Math.ceil((Array.isArray(tickets) ? tickets.length : 0) / itemsPerPage);
    
    if (!Array.isArray(tickets)) {
        console.error('Invalid tickets data:', tickets);
        return [createEmbed(null, 'Error loading tickets.')];
    }
    
    if (tickets.length === 0) {
        console.log('No tickets found in data');
        return [createEmbed(null, 'No tickets have been given to this user.')];
    }
    
    const pageTickets = tickets.slice(page * itemsPerPage, (page * itemsPerPage) + itemsPerPage);
    
    console.log(`Displaying ${pageTickets.length} tickets for page ${page + 1}/${totalPages}`);
    
    const embeds = pageTickets.map((t, index) => {
        const date = new Date(t.date).toLocaleString();
        const numericPrice = Number(t.price);
        const formattedPrice = `$${numericPrice.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })}`;
        
        console.log('Ticket data:', {
            ticketNumber: index + 1,
            issuedBy: t.issuedBy,
            offense: t.offense,
            price: t.price
        });

        return new EmbedBuilder()
            .setColor('#77DD77')
            .setTitle(`Ticket #${(page * itemsPerPage) + index + 1}`)
            .addFields(
                { name: 'Offense', value: t.offense },
                { name: 'Fine', value: formattedPrice },
                { name: 'Issued', value: date },
                { name: 'Issued By', value: t.issuedBy ? `<@${t.issuedBy}>` : 'Unknown' }
            )
            .setFooter({ text: `Page ${page + 1}/${totalPages}` });
    });

    return embeds;
}

async function handleInteractionReply(interaction, replyOptions) {
    try {
        if (!interaction.replied) {
            await interaction.reply(replyOptions);
        }
    } catch (error) {
        if (error.code !== 10062) {
            console.error('Error in handleInteractionReply:', error);
        }
    }
}

async function handleInteractionUpdate(interaction, updateOptions) {
    try {
        if (!interaction.replied) {
            await interaction.update(updateOptions);
        }
    } catch (error) {
        if (error.code !== 10062) {
            console.error('Error in handleInteractionUpdate:', error);
        }
    }
}

async function handleInteractionError(interaction) {
    try {
        if (!interaction.deferred) {
            await interaction.deferReply({ ephemeral: true });
        }
        await interaction.editReply({ 
            content: 'An error occurred while processing your request.',
            ephemeral: true 
        });
    } catch (error) {
        console.error('Error in handleInteractionError:', error);
    }
}

