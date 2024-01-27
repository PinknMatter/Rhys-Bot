const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { processBusCSV } = require('../utils/busHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buslist')
        .setDescription('Create a bus list from a CSV file')
        .addStringOption(option => 
            option.setName('filename')
                  .setDescription('Enter the CSV filename (without .csv extension)')
                  .setRequired(true)),
    async execute(interaction) {
        const filename = interaction.options.getString('filename');

        await interaction.deferReply();

        try {
            const busList = await processBusCSV(filename);

            // Separating the entries into two lists
            const busTicketList = busList.filter(person => person.ticketType === 'Bus + Ticket');
            const liftTicketOnlyList = busList.filter(person => person.ticketType === 'Lift Ticket Only');

            if (busTicketList.length > 0 || liftTicketOnlyList.length > 0) {
                // Sending Bus + Ticket list
                await sendList(interaction, busTicketList, 'Bus + Ticket List', ButtonStyle.Primary);

                // Separator message if Lift Ticket Only list is present
                if (liftTicketOnlyList.length > 0) {
                    await interaction.followUp('--- Lift Ticket Only List Below ---');
                    await sendList(interaction, liftTicketOnlyList, 'Lift Ticket Only List', ButtonStyle.Secondary);
                }
            } else {
                // Sending All Tickets list if no specific sections are present
                await sendList(interaction, busList, 'All Tickets List', ButtonStyle.Primary);
            }

            await interaction.editReply('Bus lists processed.');
        } catch (error) {
            console.error('Error processing the CSV file:', error);
            await interaction.editReply({ content: `Error: ${error.message}`, ephemeral: true });
        }
    },
};

async function sendList(interaction, list, title, buttonStyle) {
    if (list.length > 0) {
        await interaction.followUp(`**${title}**`);
        for (const [index, person] of list.entries()) {
            const content = `${person.name} - ${person.phoneNumber}`;
            const button = new ButtonBuilder()
                .setCustomId(`checkin-${index}`)
                .setLabel('Check-in')
                .setStyle(buttonStyle);

            const row = new ActionRowBuilder().addComponents(button);
            await interaction.followUp({ content, components: [row] });
        }
    }
}
