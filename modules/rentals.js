const axios = require('axios');

async function rentals(message){
    const args = message.content.split(' ').slice(1);

    if (args.length !== 4) {
        message.channel.send("Incorrect format. Please use: !rent (name) (lastname) (pair) (date)");
        return;
    }

    const [name, lastname, pair, date] = args;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        message.channel.send("Invalid date format. Please use YYYY-MM-DD format.");
        return;
    }

    if (skiPairs[pair]) {
        if (!rentedPairs[pair]) {
            rentedPairs[pair] = {};
        }

        if (rentedPairs[pair][date]) {
            message.channel.send(`Sorry, ${pair} is already rented out on ${date}.`);
            return;
        }

        // Ask about the waiver
        message.channel.send(`Thanks ${name} ${lastname}! Have you signed and sent the waiver to the club? If not, please check this link: [Waiver Link]. Payment can be sent to [link], Please include the following message when sending payment`+ " " + name+ "-" + lastname+ "-" + pair + "-"+ date);
        
        // Store the user's information
        rentedPairs[pair][date] = `${name} ${lastname}`;
    } else {
        message.channel.send(`Sorry, pair ${pair} is non-existent.`);
    }
}

async function av(message){
    const date = getNextSundayDate();
    
    const availablePairs = [];

    for (const [key, value] of Object.entries(skiPairs)) {
        if (!rentedPairs[key] || !rentedPairs[key][date]) {
            availablePairs.push(`${key} - Price: ${value.price}€`);
        }
    }

    if (availablePairs.length > 0) {
        message.channel.send(`Available rentals pairs for upcoming Sunday (${date}):\n${availablePairs.join('\n')}`);
    } else {
        message.channel.send(`Sorry, all rental pairs are rented out for the upcoming Sunday (${date}).`);
    }
}

const rentedPairs = {};

const skiPairs = {
    pair1: { available: true, price: 10, waiverSent: false },
    pair2: { available: true, price: 10, waiverSent: false },
    pair3: { available: true, price: 10, waiverSent: false },
    pair4: { available: true, price: 10, waiverSent: false },
    pair5: { available: true, price: 10, waiverSent: false },
};

function getNextSundayDate() {
    const now = new Date();
    const daysUntilNextSunday = 7 - now.getDay();
    const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextSunday);
    return nextSunday.toISOString().split('T')[0];
}

function sendRentalUpdate() {
    const date = getNextSundayDate(); // Assuming you've already defined the getNextSundayDate() function

    let rentedEquipmentList = `**Rental list for ${date}**:\n`;

    for (const [key, value] of Object.entries(rentedPairs)) {
        if (value[date]) {
            rentedEquipmentList += `${key} rented by ${value[date]}\n`;
        }
    }

    const execCornerChannel = client.channels.cache.get('exec-corner');
    if (execCornerChannel) {
        execCornerChannel.send(rentedEquipmentList);
    }
}

setInterval(() => {
    const now = new Date();
    // Check if today is Saturday (getDay() returns 6 for Saturday) and if current time is, let's say, 8 PM
    if (now.getDay() === 6 && now.getHours() === 20) {
        sendRentalUpdate();
    }
}, 3600000); // 3600000 milliseconds is 1 hour

module.exports = rentals;
module.exports = av;