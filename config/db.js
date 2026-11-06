// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn('⚠️ MONGODB_URI is not defined in environment variables. Running in fallback mode without database.');
            mongoose.set('bufferCommands', false);
            return;
        }

        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        mongoose.set('bufferCommands', false);
        console.warn('⚠️ Server will continue running with safe fallbacks until MongoDB is connected.');
    }
};

module.exports = connectDB;