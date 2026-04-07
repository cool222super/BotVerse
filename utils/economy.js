

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const fs = require('fs').promises;
const path = require('path');

const ECONOMY_FILE = path.join(__dirname, '../data/economy.json');

async function initializeEconomy() {
    try {
        await fs.access(ECONOMY_FILE);
    } catch {
        await fs.writeFile(ECONOMY_FILE, JSON.stringify({}));
    }
}

async function getBalance(userId) {
    const data = JSON.parse(await fs.readFile(ECONOMY_FILE, 'utf8'));
    if (!data[userId]) {
        data[userId] = { wallet: 0, bank: 0 };
        await fs.writeFile(ECONOMY_FILE, JSON.stringify(data, null, 2));
    }
    return data[userId];
}

async function addMoney(userId, amount, type = 'wallet') {
    const data = JSON.parse(await fs.readFile(ECONOMY_FILE, 'utf8'));
    if (!data[userId]) {
        data[userId] = { wallet: 0, bank: 0 };
    }
    data[userId][type] += amount;
    await fs.writeFile(ECONOMY_FILE, JSON.stringify(data, null, 2));
    return data[userId];
}

async function updateBalance(userId, amount, type = 'wallet') {
    const data = JSON.parse(await fs.readFile(ECONOMY_FILE, 'utf8'));
    if (!data[userId]) {
        data[userId] = { wallet: 0, bank: 0 };
    }
    data[userId][type] += amount;
    await fs.writeFile(ECONOMY_FILE, JSON.stringify(data, null, 2));
    return data[userId];
}

module.exports = {
    initializeEconomy,
    getBalance,
    addMoney,
    updateBalance
};
