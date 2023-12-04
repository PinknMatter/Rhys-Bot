// General Imports
const { Client, IntentsBitField } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

//DISCORD_TOKEN=MTExOTgwMDQ4MDgzNTU4ODExOA.GvUVsV.fVgOxhp3mebYPSnrWiHQL-raOCcWrCm8iMPhFM
//WEATHERBIT_API_KEY="d002f39c7fc94c76994a2528e6ed5716"
// Modules
const parseCSV = require('../modules/parse.js');
const weather = require('../modules/weather.js');
const rentals = require('../modules/rentals.js');
const av = require('../modules/rentals.js');
const createBus = require('../modules/bus.js');
const tripSend = require('../modules/messagesenders.js');



dotenv.config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
})

client.on('ready', () => {
    console.log(`Bot is ready as: ${client.user.tag}`);
})

client.on('messageCreate', async (message) => {

    // Weather //
    if (message.content.startsWith('!weather')) {
        await weather(message);
    }

    if(message.content.startsWith("Who's the best exec?")){
        message.channel.send("Its obviously Noah");
    }

    if(message.content.startsWith("Who's the worst exec?")){
        message.channel.send("Its obviously Ajay");
    }



    // SKI RENTAL //
    if (message.content.startsWith('!rent')) {
        await rentals(message);
    }

    if (message.content === '!av') {
       await av(message);
    }


    // CSV PARSING //
    if (message.content.startsWith('!parse')) {
        await parseCSV(message);
    }

    // Bus List //
    if (message.content.startsWith('!buslist')) {
        await createBus(message, client);
    }

    if (message.content.startsWith('!sendTrips')){
        await tripSend(message,);
    }

    



});

// client.on('interactionCreate', async (interaction) => {
    
//     if (!interaction.isButton()) return;
//    // console.log(interaction);

//     const response = await interaction.reply({
//         content: `Checked-in!`,
//         components: []   });

//     console.log(response);
    // const [action, index] = interaction.customId.split('-');

    // if (action === 'checkin') {
    //     const filename = interaction.message.content + '.json';
    //     const filePath = path.join(__dirname, '..', 'BusLists', filename);

    //     if (fs.existsSync(filePath)) {
    //         const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    //         data[index].checkedIn = true;

    //         // Acknowledge the interaction first
    //         await interaction.deferUpdate();

    //         // Perform file operations
    //         fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    //     }
    // }
// });

const PREFIX = '!';

client.login(process.env.DISCORD_TOKEN);

