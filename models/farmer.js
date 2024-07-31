const mongoose = require('mongoose');

const cropsEnum = ['Wheat', 'Corn', 'Rice', 'Soybeans', 'Barley', 'Cotton', 'Sugarcane', 'Potatoes', 'Tomatoes', 'Onions'];

const farmerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    crops: {
        type: [{
            type: String,
            enum: cropsEnum
        }],
        required: true
    },
    landSize: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
