
// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

require('dotenv').config();
const axios = require('axios');

class UnbelievaboatAPI {
    constructor() {
        this.apiKey = process.env.UNBELIEVABOAT_API_KEY;
        this.baseURL = 'https://unbelievaboat.com/api/v1';

        if (!this.apiKey) {
            console.log('API key missing (UNBELIEVABOAT_API_KEY)');
        }
    }

    async getBalance(guildId, userId) {
        if (!this.apiKey) {
            return {
                wallet: 0,
                bank: 0,
                total: 0,
                error: true
            };
        }

        try {
            const res = await axios.get(
                `${this.baseURL}/guilds/${guildId}/users/${userId}`,
                {
                    headers: {
                        Authorization: this.apiKey,
                        Accept: 'application/json'
                    },
                    timeout: 10000
                }
            );

            const data = res.data;

            const wallet = data.cash ?? 0;
            const bank = data.bank ?? 0;

            return {
                wallet,
                bank,
                total: wallet + bank
            };

        } catch (err) {
            if (err.response) {
                console.log(
                    'Unbelievaboat API error:',
                    err.response.status
                );
            } else {
                console.log('Request failed:', err.message);
            }

            return {
                wallet: 0,
                bank: 0,
                total: 0,
                error: true
            };
        }
    }
}

module.exports = new UnbelievaboatAPI();
