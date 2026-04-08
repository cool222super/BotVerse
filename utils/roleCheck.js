

// Before you use this code please know that this code is old and might have errors in it and I do not expect people saying that this code is great and all. But I understand!

// Made by Supercoolsbro :D

const fs = require('fs');
const path = require('path');

/** 

 * @param {string} 
 * @param {string} 
 * @returns {boolean|Object}
*/
function getRoleConfig(guildId, roleType = null) {
    try {
        const dataFilePath = path.join(process.cwd(), 'data', 'roles', `${guildId}.json`);
        
       
        if (!fs.existsSync(dataFilePath)) {
            return false;
        }
        
      
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        const roleData = JSON.parse(fileContent);
        
       
        if (roleType) {
            return roleData[roleType] ? roleData[roleType] : false;
        }
        
   
        return roleData;
    } catch (error) {
        console.error(`Error checking role configuration for guild ${guildId}:`, error);
        return false;
    }
}

module.exports = { getRoleConfig };

