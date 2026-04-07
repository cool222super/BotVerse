



// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refreshcommands')
        .setDescription('Refreshes all slash commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            const client = interaction.client;
            const token = process.env.token;
            const clientId = client.user.id;
            
            const commandFolders = fs.readdirSync("./commands");
            const commandNames = new Set();
            
            client.commands = new Map();
            client.commandArray = [];
            
            for (const folder of commandFolders) {
                const folderPath = path.join("./commands", folder);
                
                const stats = fs.statSync(folderPath);
                if (stats.isDirectory()) {
                    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
                    
                    for (const file of commandFiles) {
                        try {
                            delete require.cache[require.resolve(`../../commands/${folder}/${file}`)];
                            const command = require(`../../commands/${folder}/${file}`);
                            
                            if (!command.data || typeof command.data.toJSON !== "function") {
                                continue;
                            }
                            
                            const commandName = command.data.name;
                            if (commandNames.has(commandName)) {
                                continue;
                            }
                            
                            commandNames.add(commandName);
                            client.commands.set(commandName, command);
                            client.commandArray.push(command.data.toJSON());
                        } catch (error) {
                            console.error(`Error loading command file ${folder}/${file}:`, error);
                        }
                    }
                } else if (folder.endsWith(".js")) {
                    try {
                        delete require.cache[require.resolve(`../../commands/${folder}`)];
                        const command = require(`../../commands/${folder}`);
                        
                        if (!command.data || typeof command.data.toJSON !== "function") {
                            continue;
                        }

                        const commandName = command.data.name;
                        if (commandNames.has(commandName)) {
                            continue;
                        }

                        commandNames.add(commandName);
                        client.commands.set(commandName, command);
                        client.commandArray.push(command.data.toJSON());
                    } catch (error) {
                        console.error(`Error loading command file ${folder}:`, error);
                    }
                }
            }
            
            const rest = new REST({ version: "9" }).setToken(token);
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );
            
            await interaction.editReply({ 
                content: `Successfully refreshed ${client.commandArray.length} commands globally! Note: It may take up to an hour for changes to appear in all servers.`,
                ephemeral: true 
            });
            
        } catch (error) {
            console.error("Error refreshing commands:", error);
            await interaction.editReply({ 
                content: "An error occurred while refreshing commands. Check the console for details.",
                ephemeral: true 
            });
        }
    }
};
