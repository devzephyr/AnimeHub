require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const testJWT = () => {
    try {
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is missing');
        }

        const id = new mongoose.Types.ObjectId();
        console.log('Testing with ObjectId:', id);
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        });
        console.log('Generated Token:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded:', decoded);

        if (decoded.id === id) {
            console.log('JWT Verification Successful');
        } else {
            console.log('JWT Verification Failed: ID mismatch');
        }
    } catch (error) {
        console.error('JWT Error:', error.message);
    }
};

testJWT();
