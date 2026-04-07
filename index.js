

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
    console.log('Successfully connected to MongoDB database');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

const createModels = () => {
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
  
  console.log('MongoDB models successfully created');
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
    
    console.log('Vehicle data successfully loaded from MongoDB');
  } catch (error) {
    console.error('Error loading vehicle data from MongoDB:', error);
    
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
        console.error(`Error loading vehicle data from ${file}:`, error);
      }
    }
    console.log('Vehicle data loaded successfully from JSON (This is a MongoDB fallback)');
  }
};

const loadTicketsData = async () => {
  try {
    client.ticketsData = {};
    const tickets = await client.models.Ticket.find({});
    
    for (const ticket of tickets) {
      client.ticketsData[ticket.userId] = ticket.tickets;
    }
    
    console.log('Tickets data loaded successfully from MongoDB');
  } catch (error) {
    console.error('Error loading tickets data from MongoDB:', error);
    
    const ticketsDataPath = path.join(__dirname, 'data', 'tickets');
    client.ticketsData = {};

    if (!fs.existsSync(ticketsDataPath)) {
      fs.mkdirSync(ticketsDataPath, { recursive: true });
      return;
    }

    const files = fs.readdirSync(ticketsDataPath).filter(file => file.endsWith('.json'));
    for (const file of files) {
      try {
        const userId = file.replace('.json', '');
        const data = fs.readFileSync(path.join(ticketsDataPath, file), 'utf8');
        client.ticketsData[userId] = JSON.parse(data);
      } catch (error) {
        console.error(`Error loading tickets data from ${file}:`, error);
      }
    }
    console.log('Tickets data loaded successfully from JSON (This is a MongoDB fallback)');
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
    
    console.log(`Vehicle data saved to MongoDB for user ${userId}`);
  } catch (error) {
    console.error(`Error saving vehicle data to MongoDB for user ${userId}:`, error);
    
    const vehicleDataPath = path.join(__dirname, 'data', 'vehicleData');
    if (!fs.existsSync(vehicleDataPath)) {
      fs.mkdirSync(vehicleDataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(vehicleDataPath, `${userId}.json`),
      JSON.stringify(client.vehicleData[userId], null, 2)
    );
    console.log(`Vehicle data saved to JSON for user ${userId} (MongoDB fallback)`);
  }
};

client.saveTicketData = async (userId) => {
  try {
    if (!client.ticketsData[userId]) return;
    
    await client.models.Ticket.findOneAndUpdate(
      { userId },
      { userId, tickets: client.ticketsData[userId] },
      { upsert: true, new: true }
    );
    
    console.log(`Ticket data saved to MongoDB for user ${userId}`);
  } catch (error) {
    console.error(`Error saving ticket data to MongoDB for user ${userId}:`, error);
    
    const ticketsDataPath = path.join(__dirname, 'data', 'tickets');
    if (!fs.existsSync(ticketsDataPath)) {
      fs.mkdirSync(ticketsDataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(ticketsDataPath, `${userId}.json`),
      JSON.stringify(client.ticketsData[userId], null, 2)
    );
    console.log(`Ticket data saved to JSON for user ${userId} (MongoDB fallback)`);
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
    
    console.log(`Ticket data saved for user ${userId}`);
  } catch (error) {
    console.error(`Error saving ticket data for user ${userId}:`, error);
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
          console.log(`Successfully loaded event from array: ${event.name}`);
        });
      } else {
        const event = eventModule;
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }
        console.log(`Successfully loaded event: ${event.name}`);
      }
    } catch (error) {
      console.error(`Error loading event ${file}:`, error);
    }
  }
};

const loadCommands = async () => {
  const commandFolders = fs.readdirSync("./commands");
  const commandNames = new Set();

  client.commands = new Collection();
  client.commandArray = [];

  console.log('Starting to load commands...');
  console.log(`Found ${commandFolders.length} command folders/files`);

  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, "commands", folder);
    
    const stats = fs.statSync(folderPath);
    if (stats.isDirectory()) {
      console.log(`Processing directory: ${folder}`);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));
      console.log(`Found ${commandFiles.length} command files in ${folder}`);
      
      for (const file of commandFiles) {
        try {
          delete require.cache[require.resolve(`${folderPath}/${file}`)];
          const command = require(`${folderPath}/${file}`);
          
          if (!command.data || typeof command.data.toJSON !== "function") {
            console.error(`Command file ${folder}/${file} is missing required properties`);
            continue;
          }
          
          const commandName = command.data.name;
          if (commandNames.has(commandName)) {
            console.error(`Duplicate command name found: ${commandName} in ${folder}/${file}`);
            continue;
          }
          
          commandNames.add(commandName);
          client.commands.set(commandName, command);
          client.commandArray.push(command.data.toJSON());
          console.log(`Loaded command: ${commandName} from ${folder}/${file}`);
        } catch (error) {
          console.error(`Error loading command file ${folder}/${file}:`, error);
        }
      }
    } else if (folder.endsWith(".js")) {
      try {
        delete require.cache[require.resolve(folderPath)];
        const command = require(folderPath);
        
        if (!command.data || typeof command.data.toJSON !== "function") {
          console.error(`Command file ${folder} is missing required properties`);
          continue;
        }

        const commandName = command.data.name;
        if (commandNames.has(commandName)) {
          console.error(`Duplicate command name found: ${commandName} in ${folder}`);
          continue;
        }

        commandNames.add(commandName);
        client.commands.set(commandName, command);
        client.commandArray.push(command.data.toJSON());
        console.log(`Loaded command: ${commandName} from ${folder}`);
      } catch (error) {
        console.error(`Error loading command file ${folder}:`, error);
      }
    }
  }

  console.log(`Total commands loaded: ${client.commandArray.length}`);

  const rest = new REST({ version: "9" }).setToken(token);
  try {
    console.log('Started refreshing application (/) commands globally...');
    
    console.log('Commands being registered:', client.commandArray.map(cmd => cmd.name));
    
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: client.commandArray },
    );

    console.log("Slash commands successfully registered globally.");
    
    const registeredCommands = await rest.get(
      Routes.applicationCommands(clientId)
    );
    console.log('Registered commands:', registeredCommands.map(cmd => cmd.name));
    
    if (registeredCommands.some(cmd => cmd.name === 'profile')) {
      console.log('The Profile command is registered correctly');
    } else {
      console.log('The Profile command is NOT registered');
    }
  } catch (error) {
    console.error("Error registering commands:", error);
    console.error(error);
  }
};

const migrateDataToMongoDB = async () => {
  try {
    console.log('Starting data migration to MongoDB...');
    
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
          console.error(`Error migrating vehicle data from ${file}:`, error);
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
          console.error(`Error migrating tickets data from ${file}:`, error);
        }
      }
    }
    
    console.log('Data migration to MongoDB has completed');
  } catch (error) {
    console.error('Error during data migration:', error);
  }
};

(async () => {
  try {
    const mongoConnected = await connectToMongoDB();
    
    createModels();
    
    if (mongoConnected) {
      await migrateDataToMongoDB();
      
      await loadVehicleData();
      await loadTicketsData();
    } else {
      console.log('Mongodb has failed to connect so the bot will now attempt to load data from JSON files as a fallback');
      await loadVehicleData();
      await loadTicketsData();
    }
    
    await handleEvents();
    await loadCommands();
    await client.login(token);
    await initializeEconomy();
    global.cooldowns = new Map();
  } catch (error) {
    console.error("Error during bot initialization:", error);
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
