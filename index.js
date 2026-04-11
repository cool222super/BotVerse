// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

require('dotenv').config({ path: './.env' });

const { token, mongoURL } = process.env;

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');

const { initializeEconomy } = require('./utils/economy');

const connectToMongoDB = async () => {
  if (!mongoURL) {
    console.log('No mongodb URL has been set so the bot will be using JSON as a fallback');
    return false;
  }

  try {
    await mongoose.connect(mongoURL);
    console.log('MongoDB has connected');
    return true;
  } catch (err) {
    console.error('The MongoDB connection has failed:', err.message);
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


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// this part just shows that the bot is online and stuff and like how many servers the bot is in
client.once('ready', () => {
  console.log('==============================');
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Serving ${client.guilds.cache.size} servers`);
  console.log('The Bot is fully ready');
  console.log('==============================');
});

const { AsyncEventEmitter } = require('@vladfrangu/async_event_emitter');
AsyncEventEmitter.defaultMaxListeners = 25;

client.commands = new Collection();
client.commandArray = [];

global.tictactoeGames = new Map();
global.cooldowns = new Map();

const clientId = "1369400030578085908"; // this part is important as well as it will make sure to connect to the bot that you want to connect to
const readJSONFolder = (folder) => {
  const data = {};
  const dir = path.join(__dirname, 'data', folder);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return data;
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const userId = file.replace('.json', '');
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      data[userId] = JSON.parse(raw);
    } catch (err) {
      console.error(`bad file ${file}`, err.message);
    }
  }

  return data;
};

const saveJSON = (folder, userId, data) => {
  const dir = path.join(__dirname, 'data', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    path.join(dir, `${userId}.json`),
    JSON.stringify(data, null, 2)
  );
};
const loadData = async (type, model, folder) => {
  try {
    const docs = await model.find({});
    const result = {};

    for (const doc of docs) {
      result[doc.userId] = doc[type];
    }

    return result;
  } catch (err) {
    console.warn(`The ${type} mongo load has failed, so now it will be using JSON`);
    return readJSONFolder(folder);
  }
};
client.saveVehicleData = async (userId) => {
  if (!client.vehicleData[userId]) return;

  try {
    await client.models.Vehicle.findOneAndUpdate(
      { userId },
      { userId, vehicles: client.vehicleData[userId] },
      { upsert: true }
    );
  } catch {
    saveJSON('vehicleData', userId, client.vehicleData[userId]);
  }
};

client.saveTicketData = async (userId) => {
  if (!client.ticketsData[userId]) return;

  try {
    await client.models.Ticket.findOneAndUpdate(
      { userId },
      { userId, tickets: client.ticketsData[userId] },
      { upsert: true }
    );
  } catch {
    saveJSON('tickets', userId, client.ticketsData[userId]);
  }
};
const migrateDataToMongoDB = async () => {
  const migrate = async (folder, model, key) => {
    const dir = path.join(__dirname, 'data', folder);
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const userId = file.replace('.json', '');
        const raw = fs.readFileSync(path.join(dir, file), 'utf8');
        const parsed = JSON.parse(raw);

        await model.findOneAndUpdate(
          { userId },
          { userId, [key]: parsed },
          { upsert: true }
        );
      } catch (err) {
        console.error(`Failed to migrate ${file}`, err.message);
      }
    }
  };

  await migrate('vehicleData', client.models.Vehicle, 'vehicles');
  await migrate('tickets', client.models.Ticket, 'tickets');
};

const handleEvents = async () => {
  const files = fs.readdirSync('./events').filter(f => f.endsWith('.js'));

  for (const file of files) {
    try {
      const event = require(`./events/${file}`);

      const register = (e) => {
        const run = (...args) => e.execute(...args, client);
        e.once ? client.once(e.name, run) : client.on(e.name, run);
      };

      Array.isArray(event) ? event.forEach(register) : register(event);

    } catch (err) {
      console.error(`The event failed to load ${file}`, err.message);
    }
  }
};
const loadCommands = async () => {
  const folders = fs.readdirSync("./commands");
  const used = new Set();

  client.commands.clear();
  client.commandArray = [];

  for (const folder of folders) {
    const folderPath = path.join(__dirname, "commands", folder);

    const files = fs.statSync(folderPath).isDirectory()
      ? fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))
      : [folder];

    for (const file of files) {
      const fullPath = fs.statSync(folderPath).isDirectory()
        ? `${folderPath}/${file}`
        : folderPath;

      try {
        delete require.cache[require.resolve(fullPath)];
        const command = require(fullPath);

        if (!command.data?.toJSON) continue;

        const name = command.data.name;
        if (used.has(name)) continue;

        used.add(name);
        client.commands.set(name, command);
        client.commandArray.push(command.data.toJSON());

      } catch (err) {
        console.error(`The command failed to load ${file}`, err.message);
      }
    }
  }

  const rest = new REST({ version: "9" }).setToken(token);

  try {
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: client.commandArray }
    );

    console.log(`loaded ${client.commandArray.length} cmds`);
  } catch (err) {
    console.error('The command registration has failed', err.message);
  }
};

(async () => {
  try {
    const mongoConnected = await connectToMongoDB();
    createModels(client);

    if (mongoConnected) {
      await migrateDataToMongoDB();
    } else {
      console.log('Running without mongoDB since it has failed so the bot will be using JSON.');
    }

    client.vehicleData = await loadData('vehicles', client.models.Vehicle, 'vehicleData');
    client.ticketsData = await loadData('tickets', client.models.Ticket, 'tickets');

    await handleEvents();
    await loadCommands();

    await client.login(token);
    await initializeEconomy();

  } catch (err) {
    console.error('The startup has shutdown:', err);
  }
})();

process.on('unhandledRejection', err => console.error('unhandled:', err));
process.on('uncaughtException', err => console.error('crash:', err));

client.on('error', err => console.error('client error:', err));
client.on('shardError', err => console.error('ws error:', err));
