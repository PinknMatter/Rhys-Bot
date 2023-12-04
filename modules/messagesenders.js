const { EmbedBuilder, Events, GatewayIntentBits } = require('discord.js');


async function tripSend(message, client) {
    message.react('👍').then(() => message.react('👎'));

   
    message.awaitReactions({max: 1, time: 60000, errors: ['time'] })
        
  
        const trips = [
            { name: "Mont-Tremblant, Dec 3rd", emoji: "🏖️" },
            { name: "QC Weekender", emoji: "🏔️" },
            // Add more trips here
        ];
    
        const embed = new EmbedBuilder()
            .setTitle("Upcoming Trips")
            .setDescription("React with the emoji corresponding to the trip you're interested in!");
    
        trips.forEach(trip => {
            embed.addFields({ name: trip.name, value: trip.emoji, inline: true });
        });
    
        const tripMessage = await message.channel.send({ embeds: [embed] });
    
        for (const trip of trips) {
            await tripMessage.react(trip.emoji);
        }
    
        const filter = (reaction, user) => {
            return trips.some(trip => trip.emoji === reaction.emoji.name) && !user.bot;
        };
    
        const collector = tripMessage.createReactionCollector({ filter });
    
        collector.on('collect', (reaction, user) => {
            const trip = trips.find(trip => trip.emoji === reaction.emoji.name);
            message.channel.send(`${user.tag} reacted with ${reaction.emoji.name} and is interested in "${trip.name}"`);
        });
}

module.exports = tripSend;
