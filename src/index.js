// General Imports
const { Client, IntentsBitField, SlashCommandBuilder, Collection} = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');


// Modules
const parseCSV = require('../modules/parse.js');
const weather = require('../modules/weather.js');
const rentals = require('../modules/rentals.js');
const av = require('../modules/rentals.js');
const createBus = require('../modules/bus.js');
const tripSend = require('../modules/messagesenders.js');
const handleBusListCommand = require('../modules/bus.js');



dotenv.config();

const client = new Client({
    intents: [
        3242773
    ]
})

client.on('ready', () => {
    console.log(`Bot is ready as: ${client.user.tag}`);
})


//Commands Handler
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.data.name, command);
}

//Events Handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}










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

client.login("MTExOTgwMDQ4MDgzNTU4ODExOA.GvUVsV.fVgOxhp3mebYPSnrWiHQL-raOCcWrCm8iMPhFM");

