
// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

const fetch = require('node-fetch');
require('dotenv').config();

class UnbelievaboatAPI {
    constructor() {
        this.apiKey = process.env.UNBELIEVABOAT_API_KEY;
        if (!this.apiKey) {
            console.error('UNBELIEVABOAT_API_KEY is not set in environment variables');
        }
        this.baseURL = 'https://unbelievaboat.com/api/v1';
    }

    async getBalance(guildId, userId) {
        try {
            if (!this.apiKey) {
                throw new Error('Unbelievaboat API key is not configured');
            }

            
            console.log('Making request to Unbelievaboat API:', {
                url: `${this.baseURL}/guilds/${guildId}/users/${userId}`,
                apiKeyLength: this.apiKey.length
            });

            const response = await fetch(`${this.baseURL}/guilds/${guildId}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': this.apiKey, 
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Unbelievaboat API Response:', {
                    status: response.status,
                    headers: response.headers,
                    body: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            return {
                wallet: data.cash || 0,
                bank: data.bank || 0,
                total: (data.cash || 0) + (data.bank || 0)
            };
        } catch (error) {
            console.error('Error fetching Unbelievaboat balance:', error);
            return { 
                wallet: 0, 
                bank: 0, 
                total: 0,
                error: 'Unable to fetch balance at this time'
            };
        }
    }
}

module.exports = new UnbelievaboatAPI();
