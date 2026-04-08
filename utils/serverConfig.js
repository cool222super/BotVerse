

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D



const fs = require('fs');
const path = require('path');

/**

 * @param {string} 
 * @returns {Object} 
 */
function getServerConfig(serverId) {
    try {
        const configPath = path.join(process.cwd(), 'data', 'serverConfig', `${serverId}.json`);
        
       
        const fileExists = fs.existsSync(configPath);
        console.log(`Config file for server ${serverId} exists: ${fileExists}`);
        
        if (!fileExists) {
            console.log(`Creating default config for server ${serverId}`);
            return {
                staffRole: null,
                civilianRole: null,
                vehicleLimit: 3 
            };
        }
        
    
        const rawData = fs.readFileSync(configPath, 'utf8');
        console.log(`Raw config data for server ${serverId}:`, rawData);
        
        const config = JSON.parse(rawData);
        
     
        console.log(`Parsed config for server ${serverId}:`, config);
        
        
        if (config.vehicleLimit === undefined || config.vehicleLimit === null) {
            config.vehicleLimit = 3; 
        } else {
          
            config.vehicleLimit = Number(config.vehicleLimit);
            if (isNaN(config.vehicleLimit)) config.vehicleLimit = 3; 
        }
        
        console.log(`Final vehicle limit for server ${serverId}: ${config.vehicleLimit} (type: ${typeof config.vehicleLimit})`);
        
        return config;
    } catch (error) {
        console.error(`Error loading server config for ${serverId}:`, error);
        return {
            staffRole: null,
            civilianRole: null,
            vehicleLimit: 3 
        };
    }
}

/**
 
 * @param {Object} 
 * @param {string} 
 * @returns {boolean} 
 */
function hasStaffRole(member, serverId) {
    const config = getServerConfig(serverId);
    
    if (!config.staffRole) return false;
    
    return member.roles.cache.has(config.staffRole);
}

/**
 
 * @param {Object} 
 * @param {string} 
 * @returns {boolean} 
 */
function hasCivilianRole(member, serverId) {
    const config = getServerConfig(serverId);
    
    if (!config.civilianRole) return false;
    
    return member.roles.cache.has(config.civilianRole);
}

/**
 
 * @param {string} 
 * @returns {number} 
 */
function getVehicleLimit(serverId) {
    try {
        const configPath = path.join(process.cwd(), 'data', 'serverConfig', `${serverId}.json`);
        
        if (!fs.existsSync(configPath)) {
            return 3; 
        }
        
        const rawData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(rawData);
        
        
        return Number(config.vehicleLimit) || 3;
    } catch (error) {
        console.error(`Error getting vehicle limit: ${error.message}`);
        return 3; 
    }
}

module.exports = {
    getServerConfig,
    hasStaffRole,
    hasCivilianRole,
    getVehicleLimit
};




