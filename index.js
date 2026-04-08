

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

require('dotenv').config({ path: './.env' });
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const path = require('path');
const { initializeEconomy } = require('./utils/economy');
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log('connected to mongodb');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

const createModels = (client) => {
  const vehicleSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    vehicles: [{ 
      make: String,
      model: String,
      year: String,
      color: String,
      licensePlate: String,
      registrationDate: { type: Date, default: Date.now }
    }]
  });
  
  const ticketSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    tickets: [{
      reason: String,
      date: { type: Date, default: Date.now },
      officer: String,
      fine: Number
    }]
  });
  
  const economySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 }
  });
  
  client.models = {
    Vehicle: mongoose.model('Vehicle', vehicleSchema),
    Ticket: mongoose.model('Ticket', ticketSchema),
    Economy: mongoose.model('Economy', economySchema)
  };
  
};

global.tictactoeGames = new Map();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

const { AsyncEventEmitter } = require('@vladfrangu/async_event_emitter');
AsyncEventEmitter.defaultMaxListeners = 25;

client.commands = new Collection();
client.commandArray = [];

const clientId = "1369400030578085908"; 

const loadVehicleData = async () => {
  try {
    client.vehicleData = {};
    const vehicles = await client.models.Vehicle.find({});
    
    for (const vehicle of vehicles) {
      client.vehicleData[vehicle.userId] = vehicle.vehicles;
    }
    
  } catch (error) {
    console.error('The bot has failed to load vehicle data from mongodb, the bot is going to try falling back to json:', error);

    const vehicleDataPath = path.join(__dirname, 'data', 'vehicleData');
    client.vehicleData = {};

    if (!fs.existsSync(vehicleDataPath)) {
      fs.mkdirSync(vehicleDataPath, { recursive: true });
      return;
    }

    const files = fs.readdirSync(vehicleDataPath).filter(file => file.endsWith('.json'));
    for (const file of files) {
      try {
        const userId = file.replace('.json', '');
        const data = fs.readFileSync(path.join(vehicleDataPath, file), 'utf8');
        client.vehicleData[userId] = JSON.parse(data);
      } catch (error) {
        console.error(`error reading ${file}:`, error);
      }
    }
  }
};

const loadTicketsData = async () => {
  try {
    client.ticketsData = {};
    const tickets = await client.models.Ticket.find({});
    for (const ticket of tickets) {
      client.ticketsData[ticket.userId] = ticket.tickets;
    }
  } catch (error) {
    console.error('The bot has failed to load ticket data from mongodb, the bot is going to try falling back to json:', error);

    const ticketsDataPath = path.join(__dirname, 'data', 'tickets');
    client.ticketsData = {};

    if (!fs.existsSync(ticketsDataPath)) {
      fs.mkdirSync(ticketsDataPath, { recursive: true });
      return;
    }

    for (const file of fs.readdirSync(ticketsDataPath).filter(f => f.endsWith('.json'))) {
      try {
        client.ticketsData[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(ticketsDataPath, file), 'utf8'));
      } catch {
        console.error(`Error reading ${file}`);
      }
    }
  }
};

client.saveVehicleData = async (userId) => {
  try {
    if (!client.vehicleData[userId]) return;
    
    await client.models.Vehicle.findOneAndUpdate(
      { userId },
      { userId, vehicles: client.vehicleData[userId] },
      { upsert: true, new: true }
    );
    
  } catch (error) {
    console.error(`The bot has failed to save vehicle data for ${userId}:`, error);

    const vehicleDataPath = path.join(__dirname, 'data', 'vehicleData');
    if (!fs.existsSync(vehicleDataPath)) {
      fs.mkdirSync(vehicleDataPath, { recursive: true });
    }

    fs.writeFileSync(
      path.join(vehicleDataPath, `${userId}.json`),
      JSON.stringify(client.vehicleData[userId], null, 2)
    );
  }
};

client.saveTicketData = async (userId) => {
  try {
    if (!client.ticketsData[userId]) return;
    
    const ticketsDataPath = path.join(__dirname, 'data', 'tickets');
    if (!fs.existsSync(ticketsDataPath)) {
      fs.mkdirSync(ticketsDataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(ticketsDataPath, `${userId}.json`),
      JSON.stringify(client.ticketsData[userId], null, 2)
    );
    
  } catch (error) {
    console.error(`The bot has failed to save ticket data for ${userId}:`, error);
  }
};

const handleEvents = async () => {
  const eventFiles = fs.readdirSync(`./events`).filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    try {
      const eventModule = require(`./events/${file}`);
      
      if (Array.isArray(eventModule)) {
        eventModule.forEach(event => {
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }

        });
      } else {
        const event = eventModule;
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }

      }
    } catch (error) {
      console.error(`The bot has failed to load event ${file}:`, error);
    }
  }
};

const loadCommands = async () => {
  const commandFolders = fs.readdirSync("./commands");
  const commandNames = new Set();

  client.commands = new Collection();
  client.commandArray = [];

  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, "commands", folder);

    const stats = fs.statSync(folderPath);
    if (stats.isDirectory()) {
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

      for (const file of commandFiles) {
        try {
          delete require.cache[require.resolve(`${folderPath}/${file}`)];
          const command = require(`${folderPath}/${file}`);

          if (!command.data || typeof command.data.toJSON !== "function") {
            console.error(`${folder}/${file} is missing required properties`);
            continue;
          }

          const commandName = command.data.name;
          if (commandNames.has(commandName)) {
            console.error(`There is a duplicate command: ${commandName} in ${folder}/${file}`);
            continue;
          }

          commandNames.add(commandName);
          client.commands.set(commandName, command);
          client.commandArray.push(command.data.toJSON());
        } catch (error) {
          console.error(`Error loading ${folder}/${file}:`, error);
        }
      }
    } else if (folder.endsWith(".js")) {
      try {
        delete require.cache[require.resolve(folderPath)];
        const command = require(folderPath);

        if (!command.data || typeof command.data.toJSON !== "function") {
          console.error(`${folder} is missing required properties`);
          continue;
        }

        const commandName = command.data.name;
        if (commandNames.has(commandName)) {
          console.error(`There is a duplicate command: ${commandName} in ${folder}`);
          continue;
        }

        commandNames.add(commandName);
        client.commands.set(commandName, command);
        client.commandArray.push(command.data.toJSON());
      } catch (error) {
        console.error(`Error loading ${folder}:`, error);
      }
    }
  }

  const rest = new REST({ version: "9" }).setToken(token);
  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: client.commandArray },
    );
    console.log(`registered ${client.commandArray.length} commands`);
  } catch (error) {
    console.error('The bot has failed to register commands:', error);
  }
};

const migrateDataToMongoDB = async () => {
  try {

    
    const vehicleDataPath = path.join(__dirname, 'data', 'vehicleData');
    if (fs.existsSync(vehicleDataPath)) {
      const files = fs.readdirSync(vehicleDataPath).filter(file => file.endsWith('.json'));
      for (const file of files) {
        try {
          const userId = file.replace('.json', '');
          const data = fs.readFileSync(path.join(vehicleDataPath, file), 'utf8');
          const vehicles = JSON.parse(data);
          
          await client.models.Vehicle.findOneAndUpdate(
            { userId },
            { userId, vehicles },
            { upsert: true }
          );
        } catch (error) {
          console.error(`The bot has failed to migrate vehicle data from ${file}:`, error);
        }
      }
    }
    
    const ticketsDataPath = path.join(__dirname, 'data', 'tickets');
    if (fs.existsSync(ticketsDataPath)) {
      const files = fs.readdirSync(ticketsDataPath).filter(file => file.endsWith('.json'));
      for (const file of files) {
        try {
          const userId = file.replace('.json', '');
          const data = fs.readFileSync(path.join(ticketsDataPath, file), 'utf8');
          const tickets = JSON.parse(data);
          
          await client.models.Ticket.findOneAndUpdate(
            { userId },
            { userId, tickets },
            { upsert: true }
          );
        } catch (error) {
          console.error(`The bot has failed to migrate ticket data from ${file}:`, error);
        }
      }
    }
    

  } catch (error) {
    console.error('The data migration has failed:', error);
  }
};

(async () => {
  try {
    const mongoConnected = await connectToMongoDB();
    
    createModels(client);
    
    if (mongoConnected) {
      await migrateDataToMongoDB();
      
      await loadVehicleData();
      await loadTicketsData();
    } else {
      console.log('Mongodb has failed to connect, the bot will now try to load from json instead');
      await loadVehicleData();
      await loadTicketsData();
    }
    
    await handleEvents();
    await loadCommands();
    await client.login(token);
    await initializeEconomy();
    global.cooldowns = new Map();
  } catch (error) {
    console.error('The bot init has failed:', error);
  }
})();

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

client.on('error', (error) => {
  console.error('Client error:', error);
});

client.on('shardError', (error) => {
  console.error('WebSocket error:', error);
});
