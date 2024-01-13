const { SlashCommandBuilder } = require('@discordjs/builders');


let raffleEntries = new Set();

const executeRaffleCommand = async (interaction) => {
    if (interaction.options.getSubcommand() === 'enter') {
        const username = interaction.user.tag; // Get the user's tag
        
        if (raffleEntries.has(username)) {
            await interaction.reply({ content: 'You have already entered the raffle.', ephemeral: true });
        } else {
            raffleEntries.add(username);
            await interaction.reply({ content: `${username} has entered the raffle!`, ephemeral: true });
        }
    }   else if (interaction.options.getSubcommand() === 'draw') {
        if (!hasExecutivesRole(interaction.member)) {
            await interaction.reply({ content: "Sorry, you need to have the 'Executives' role to use this command.", ephemeral: true });
            return;
        }

        await interaction.deferReply(); // Defer the reply for processing time

        if (raffleEntries.size === 0) {
            await interaction.editReply('No entries in the raffle to draw from.');
            return;
        }

        // Randomly select a winner
        const entriesArray = Array.from(raffleEntries);
        const winner = entriesArray[Math.floor(Math.random() * entriesArray.length)];

        await interaction.editReply(`${winner} has won the raffle!`); // Update the deferred reply with the winner
        raffleEntries.clear(); // Clear entries after the draw

    }
};

const hasExecutivesRole = (member) => {
    // Implement role check logic
    return member.roles.cache.some(role => role.name === 'Executives');
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raffle')
        .setDescription('Manage a raffle')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enter')
                .setDescription('Enter the raffle'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('draw')
                .setDescription('Draw a winner (Executives only)')),
    // ... execute logic will be added here ...
    async execute(interaction) {
        await executeRaffleCommand(interaction);
    },
};
