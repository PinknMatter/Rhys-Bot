const { SlashCommandBuilder } = require('@discordjs/builders');
const { saveCSV, listCSVFiles, deleteCSV, readCSV, updateCSV, transferTicket } = require('../utils/csvHandler'); // Assuming you have a utility function for saving CSVs

module.exports = {
    
    data: new SlashCommandBuilder()
    .setName('parse')
    .setDescription('Parse commands')
    .addSubcommand(subcommand =>
        subcommand
            .setName('save')
            .setDescription('Save a CSV file')
            .addStringOption(option => option.setName('name').setDescription('Enter a name').setRequired(true))
            .addAttachmentOption(option => option.setName('file').setDescription('Upload a CSV file').setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('update')
            .setDescription('update a CSV file')
            .addStringOption(option => option.setName('name').setDescription('Original File Name').setRequired(true))
            .addAttachmentOption(option => option.setName('file').setDescription('Upload a CSV file').setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List all CSV files')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('read')
            .setDescription('Read a CSV file')
            .addStringOption(option => option.setName('filename').setDescription('Enter the filename without .csv').setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('transfer')
            .setDescription('Transfer a ticket')
            .addStringOption(option => option.setName('csvname').setDescription('Enter the CSV filename').setRequired(true))
            .addStringOption(option => option.setName('orderid').setDescription('Enter the Order ID of the seller').setRequired(true))
            .addStringOption(option => option.setName('buyername').setDescription('Enter the name of the buyer').setRequired(true))
            .addStringOption(option => option.setName('buyeremail').setDescription('Enter the email of the buyer').setRequired(true))
            .addStringOption(option => option.setName('buyerphone').setDescription('Enter the phone number of the buyer').setRequired(true))
            )

    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Delete a CSV file')
            .addStringOption(option => option.setName('name').setDescription('Enter the name of the file to delete').setRequired(true))
    ),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'save') {
            const fileName = interaction.options.getString('name');
            const file = interaction.options.getAttachment('file');
            console.log('File Content Type:', file.contentType);
            // Add logic to handle file saving
            if (file.contentType.includes('text/csv') || file.contentType.includes('application/vnd.ms-excel')) {
                try {
                    console.log("here");
                    const response = await saveCSV(interaction, fileName, file.url);
                    await interaction.reply(response);
                } catch (error) {
                    await interaction.reply(error);
                }
            } else {
                await interaction.reply('Please attach a CSV file.');
            }
        } else if (interaction.options.getSubcommand() === 'list') {
            const fileList = listCSVFiles();
            await interaction.reply(fileList);
        } else if (interaction.options.getSubcommand() === 'delete') {
            const fileName = interaction.options.getString('name');
            const response = deleteCSV(fileName);
            await interaction.reply(response);
        } else if (interaction.options.getSubcommand() === 'read') {
            const fileName = interaction.options.getString('filename');
            const response = await readCSV(fileName);
            await interaction.reply(response || 'Error occurred.');
        } else if (interaction.options.getSubcommand() === 'update') {
            const originalFileName = interaction.options.getString('name');
            const newFileAttachment = interaction.options.getAttachment('file');
    
            if (newFileAttachment.contentType.includes('text/csv') || newFileAttachment.contentType.includes('application/vnd.ms-excel')) {
                const response = await updateCSV(originalFileName, newFileAttachment.url);
                await interaction.reply(response);
            } else {
                await interaction.reply('Please attach a CSV file.');
            }
        } else if (interaction.options.getSubcommand() === 'transfer') {
            const csvName = interaction.options.getString('csvname');
            const orderId = interaction.options.getString('orderid');
            const buyerName = interaction.options.getString('buyername');
            const buyerEmail = interaction.options.getString('buyeremail');
            const buyerPhone = interaction.options.getString('buyerphone');
        
            const response = await transferTicket(csvName, orderId, buyerName, buyerEmail, buyerPhone);
            await interaction.reply(response);
        }
    },
};