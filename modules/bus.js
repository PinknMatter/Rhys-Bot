const fs = require('fs');
const Papa = require('papaparse');
const axios = require('axios');
const path = require('path');
const { MessageActionRow, MessageButton, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');


// Function to create a bus list from a CSV file
async function createBus(message, client) {
 
        // Check for "Executives" role
        const args = message.content.split(' ').slice(1);

        const roleName = "Executives";
        const member = message.member;
        const executivesRole = message.guild.roles.cache.find(role => role.name === roleName);

        if (!executivesRole || !member.roles.cache.has(executivesRole.id)) {
            message.channel.send("Sorry, you need to have the 'Executives' role to use this command.");
            return;
        }
        if (args.length === 0) {
        // Check if the message has an attachment
        if (message.attachments.size > 0) {
            const attachment = message.attachments.first();
            try {
                // Download the CSV file
                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                const csvData = response.data.toString('utf8');

                // Parse the CSV data
                const parsedData = Papa.parse(csvData, { header: true }).data;

                // Filter data for rows containing 'bus' in 'Lineitem Variant' and create a list
                const busList = parsedData
                .filter(row => row['Lineitem variant'] && row['Lineitem variant'].toLowerCase().includes('bus'))
                .map(row => ({
                    name: row['Billing Name'],
                    checkedIn: false
                }));

                const count = busList.length; // Count of names added to the JSON


                // Extract the first word from "Lineitem name" for the filename
                const filename = parsedData[0]['Lineitem name'].split(' ')[0];

                // Define the folder and file path
                const folderPath = './BusLists';
                const filePath = path.join(folderPath, `${filename}.json`);

                // Create the folder if it doesn't exist
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath);
                }

                // Write the data to a JSON file in the specified folder
                fs.writeFileSync(filePath, JSON.stringify(busList, null, 2));

                // Respond to the user
                message.channel.send(`Bus list created: ${filename}.json with ${count} names.`);
            } catch (error) {
                console.error('Error processing the CSV file:', error);
                message.channel.send('There was an error processing the CSV file.');
            }
        } else {
            message.channel.send('Please attach a CSV file with the command.');
        }
    } else {
        // Display the existing list with buttons
        const filename = args[0] + '.json';
        const filePath = path.join(__dirname, '..', 'BusLists', filename);

        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            data.forEach( async (person, index) => {
             
              
                const confirm = new ButtonBuilder()                       
                            .setCustomId(`checkin-${index}`)
                            .setLabel('Check-in')
                            .setStyle(ButtonStyle.Primary)
                    
                            
                            const row = new ActionRowBuilder().addComponents(confirm);
                            message.channel.send({ content: `${person.name}`, components: [row] });
                          

                                
                           
                        });

                         

                        client.on('interactionCreate', async (interaction) => {
                            if (!interaction.isButton()) return;
                            if (!interaction.customId.startsWith('checkin-')) return;
                        
                            // Clone the existing components and create new instances
                            const components = interaction.message.components.map(component => {
                                const row = new ActionRowBuilder();
                                component.components.forEach(button => {
                                    const newButton = ButtonBuilder.from(button);
                                    if (newButton.data.custom_id === interaction.customId) {
                                        newButton.setStyle(ButtonStyle.Success)
                                                 .setLabel('Checked!')
                                                 .setDisabled(true);
                                    }
                                    row.addComponents(newButton);
                                });
                                return row;
                            });
                        
                            // Update the message with the modified components
                            await interaction.update({
                                content: interaction.message.content,
                                components: components
                            });
                        });
                            // if (!interaction.isButton()) return;
                        
                            // const customId = interaction.customId;
                            // if (!customId.startsWith('checkin-')) return;
                        
                            // // Extracting the index from the custom ID
                            // const index = parseInt(customId.split('-')[1], 10);
                            // const personName = interaction.message.content; // Name is in the message content
                        
                            // Define the JSON file path
                            // Assuming the filename is stored somewhere accessible, like in client or interaction
                            // const filename = 'Mont-Tremblant.json'; // Replace with actual logic to get filename
                            // const filePath = path.join(__dirname, '..', 'BusLists', filename);
                        
                            // if (fs.existsSync(filePath)) {
                            //     const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                        
                            //     // Find the person in the data and update their checked-in status
                            //     const person = data.find(p => p.name === personName);
                            //     if (person) {
                            //         person.checkedIn = true;
                            //         fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                        
                            //         // Update the button to show checked-in status
                            //         await interaction.update({ 
                            //             content: `${personName} is now checked in.`,
                            //             components: [] // Remove the button or update as needed
                            //         });
                            //     } else {
                            //         // Handle case where person is not found (optional)
                            //         await interaction.reply({ content: 'Person not found in the list.', ephemeral: true });
                            //     }
                            // } else {
                            //     // File not found handling
                            //     await interaction.reply({ content: 'List file not found.', ephemeral: true });
                            // }
                 
                    

             
                     
             
         
        } else {
            message.channel.send('File not found.');
        }
    }

    
}


// Export the function for use in your bot
module.exports = createBus;