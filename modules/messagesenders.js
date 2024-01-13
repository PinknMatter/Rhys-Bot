
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function tripSend(interaction, client) {
    // Define the trips
    const trips = [
        { name: "Mont-Tremblant", emoji: "🏖️" },
        { name: "Quebec City", emoji: "🏔️" },
        { name: "Bromont", emoji: "🏞" },
        { name: "Jay-Peak", emoji: "🚀" },
        { name: "Saint-Sauveur", emoji: "🌨" },
    ];

    // Create the embed
    const embed = new EmbedBuilder()
        .setTitle("Upcoming Trips")
        .setDescription("React with the emoji corresponding to the mountain you're interested in!");

    // Add trips to the embed
    trips.forEach(trip => {
        embed.addFields({ name: trip.name, value: trip.emoji, inline: true });
    });

    // Send the embed in an interaction reply
    await interaction.reply({ embeds: [embed], fetchReply: true }).then(sentMessage => {
        for (const trip of trips) {
            sentMessage.react(trip.emoji);
        }

        // Reaction collector
        const filter = (reaction, user) => {
            return trips.some(trip => trip.emoji === reaction.emoji.name) && !user.bot;
        };

        const collector = sentMessage.createReactionCollector({ filter, dispose: true });

        collector.on('collect', async (reaction, user) => {
            const trip = trips.find(trip => trip.emoji === reaction.emoji.name);
            if (!trip) return;

            const role = interaction.guild.roles.cache.find(r => r.name === trip.name);
            if (!role) {
                console.log(`Role not found: ${trip.name}`);
                return;
            }

            const member = await interaction.guild.members.fetch(user.id);
            member.roles.add(role);
           console.log(`${user} added to "${trip.name}" channel.`);
        });

        collector.on('remove', async (reaction, user) => {
            const trip = trips.find(trip => trip.emoji === reaction.emoji.name);
            if (!trip) return;

            const role = interaction.guild.roles.cache.find(r => r.name === trip.name);
            if (!role) {
                console.log(`Role not found: ${trip.name}`);
                return;
            }

            const member = await interaction.guild.members.fetch(user.id);
            member.roles.remove(role);
           console.log(`${user} removed from "${trip.name}" channel.`);
        });
    });
}

module.exports = tripSend;
