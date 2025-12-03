/**************************************************************
* File Name: config/db.js
* Author: Neel S Patel
* Course: WEB322
* Seneca Email: nspatel55@myseneca.ca
* Date: December 2, 2025
*
* Description:
*   Handles database connections for MongoDB and PostgreSQL.
**************************************************************/

// config/db.js
const mongoose = require("mongoose");
const { Sequelize } = require("sequelize");

// --------------------------------------
// MONGO CONNECTION
// --------------------------------------
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Error:", err.message);
    }
};

// --------------------------------------
// POSTGRES CONNECTION (SEQUELIZE)
// --------------------------------------
const sequelize = new Sequelize(process.env.POSTGRES_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

// Initialize DB + sync models
const initPostgres = async () => {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL Initialization Complete");

        // IMPORTANT: This creates ALL tables
        await sequelize.sync();
        console.log("PostgreSQL Synced");
    } catch (err) {
        console.error("Sequelize Error:", err.message);
    }
};

module.exports = { connectMongo, initPostgres, sequelize };
