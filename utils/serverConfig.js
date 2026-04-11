// Before you use this code please know that this code is old and might have errors in it.
// I don’t guarantee it’s perfect, but it should work fine.

// Made by Supercoolsbro :D


const fs = require('fs');
const path = require('path');

const configDir = path.join(process.cwd(), 'data', 'serverConfig');

function getConfigPath(serverId) {
    return path.join(configDir, `${serverId}.json`);
}

function getServerConfig(serverId) {
    try {
        const file = getConfigPath(serverId);

        if (!fs.existsSync(file)) {
            return {
                staffRole: null,
                civilianRole: null,
                vehicleLimit: 3
            };
        }

        const config = JSON.parse(fs.readFileSync(file, 'utf8'));

        return {
            staffRole: config.staffRole ?? null,
            civilianRole: config.civilianRole ?? null,
            vehicleLimit: Number(config.vehicleLimit) || 3
        };

    } catch (err) {
        console.log('The config load has failed:', err.message);

        return {
            staffRole: null,
            civilianRole: null,
            vehicleLimit: 3
        };
    }
}

function hasStaffRole(member, serverId) {
    const config = getServerConfig(serverId);
    if (!config.staffRole) return false;

    return member.roles.cache.has(config.staffRole);
}

function hasCivilianRole(member, serverId) {
    const config = getServerConfig(serverId);
    if (!config.civilianRole) return false;

    return member.roles.cache.has(config.civilianRole);
}

function getVehicleLimit(serverId) {
    const config = getServerConfig(serverId);
    return config.vehicleLimit || 3;
}

module.exports = {
    getServerConfig,
    hasStaffRole,
    hasCivilianRole,
    getVehicleLimit
};
