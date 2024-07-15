const fs = require('fs');
const path = require('path');

const userFilePath = path.join(__dirname, 'user.json');

// Function to read users from JSON file
const readUsers = () => {
  try {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // If file doesn't exist or error reading, return empty array
    return [];
  }
};

// Function to write users to JSON file
const writeUsers = (users) => {
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error writing users to file:', err);
  }
};

module.exports = { readUsers, writeUsers };
