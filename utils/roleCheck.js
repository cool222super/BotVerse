// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D

const fs = require('fs');
const path = require('path');

/**
 * this gets the role configs for the guild
 * @param {string} guildId
 * @param {string|null} roleType
 * @returns {Object|boolean}
 */
function getRoleConfig(guildId, roleType = null) {
    try {
        const filePath = path.join(process.cwd(), 'data', 'roles', `${guildId}.json`);
        if (!fs.existsSync(filePath)) {
            return false;
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const config = JSON.parse(raw);
        if (roleType) {
            return config[roleType] ?? false;
        }

        return config;
    } catch (err) {
        console.error(`Failed to load role config for guild ${guildId}:`, err);
        return false;
    }
}

module.exports = { getRoleConfig };
