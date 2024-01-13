const fs = require('fs');
const Papa = require('papaparse');
const axios = require('axios');
const path = require('path');
const { MessageActionRow, MessageButton, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const buttonStates = {}; // This will track the state of each button


// Function to create a bus list from a CSV file
async function createBus(message, client) {
    const args = message.content.split(' ').slice(1);
    const roleName = "Executives";
    const member = message.member;
    const executivesRole = message.guild.roles.cache.find(role => role.name === roleName);

    if (!executivesRole || !member.roles.cache.has(executivesRole.id)) {
        message.channel.send("Sorry, you need to have the 'Executives' role to use this command.");
        return;
    }

    if (args.length === 0 && message.attachments.size > 0) {
        // Processing CSV file attachment
        const attachment = message.attachments.first();
        try {
            const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
            const csvData = response.data.toString('utf8');
            const parsedData = Papa.parse(csvData, { header: true }).data;

            const busList = parsedData.map(row => ({
                name: row['Product Form: Ticket Holder\'s Name'] || 'unknown', // Default to 'unknown' if empty or undefined
                phoneNumber: row['Product Form: Ticket Holder\'s Phone'] || 'unknown',
                ticketType: row['Lineitem variant'] || 'all',
                checkedIn: false
            })).sort((a, b) => {
                // Handle undefined values in sorting
                if (!a.name) return 1;  // Push undefined or empty names to the end
                if (!b.name) return -1;
                return a.name.localeCompare(b.name);
            });

            const filename = parsedData[0]['Lineitem name'].split(' ')[0];
            const folderPath = './BusLists';
            const filePath = path.join(folderPath, `${filename}.json`);

            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }

            fs.writeFileSync(filePath, JSON.stringify(busList, null, 2));
            message.channel.send(`Bus list created: ${filename}.json with ${busList.length} names.`);
        } catch (error) {
            console.error('Error processing the CSV file:', error);
            message.channel.send('There was an error processing the CSV file.');
        }
    } else if (args.length > 0) {
        
        if (args[0].toLowerCase() === 'list') {
            const folderPath = './BusLists';
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    message.channel.send('Error reading the directory.');
                    console.error('Directory read error:', err);
                    return;
                }
                const jsonFiles = files.filter(file => file.endsWith('.json'));
                const fileListMessage = jsonFiles.length > 0 ? jsonFiles.join('\n') : 'No bus lists found.';
                message.channel.send(`Available Bus Lists:\n${fileListMessage}`);
            });
        }
        // Handling !buslist command with filtering
       
        const filename = args.length > 0 ? args[0] : null;
        const filePath = path.join(__dirname, '..', 'BusLists', `${filename}.json`);
        
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
            // Filter for 'bus'
            const busList = data.filter(person => 
                person.ticketType && person.ticketType.toLowerCase().includes('bus')
            );
        
            // Filter for 'Lift Ticket Only'
            const ticketOnlyList = data.filter(person => 
                person.ticketType && person.ticketType.toLowerCase().includes('lift ticket only')
            );
        
            // Send 'bus' list
            if (busList.length > 0) {
                await message.channel.send('**Bus List:**');
                for (const [index, person] of busList.entries()) {
                    const confirm = new ButtonBuilder()
                        .setCustomId(`checkin-bus-${index}`)
                        .setLabel('Check-in')
                        .setStyle(ButtonStyle.Primary);
        
                    const row = new ActionRowBuilder().addComponents(confirm);
                    await message.channel.send({ content: `${person.name} - ${person.phoneNumber}`, components: [row] });
                }
            }
        
            // Send 'Lift Ticket Only' list
            if (ticketOnlyList.length > 0) {
                await message.channel.send('**Lift Ticket Only List:**');
                for (const [index, person] of ticketOnlyList.entries()) {
                    const confirm = new ButtonBuilder()
                        .setCustomId(`checkin-ticket-only-${index}`)
                        .setLabel('Check-in')
                        .setStyle(ButtonStyle.Secondary);
        
                    const row = new ActionRowBuilder().addComponents(confirm);
                    await message.channel.send({ content: `${person.name} - ${person.phoneNumber}`, components: [row] });
                }
            }
      

                            client.on('interactionCreate', async (interaction) => {
                            if (!interaction.isButton()) return;
                            if (!interaction.customId.startsWith('checkin-')) return;
                        
                            const customId = interaction.customId;
                        
                            // Determine the new state based on the current state
                            const currentState = buttonStates[customId] || 'initial';
                            let newState;
                            let newLabel;
                            let newStyle;
                        
                            if (currentState === 'initial') {
                                newState = 'danger';
                                newLabel = 'Checked-in';
                                newStyle = ButtonStyle.Danger;
                            } else if (currentState === 'danger') {
                                newState = 'success';
                                newLabel = 'On The Bus!';
                                newStyle = ButtonStyle.Success;
                            } else if (currentState === 'success') {
                                newState = 'initial';
                                newLabel = 'Check-in';
                                newStyle = ButtonStyle.Primary;
                            }
                        
                            // Update the button state
                            buttonStates[customId] = newState;
                        
                            // Clone the existing components and create new instances
                            const components = interaction.message.components.map(component => {
                                const row = new ActionRowBuilder();
                                component.components.forEach(button => {
                                    const newButton = ButtonBuilder.from(button);
                                    if (newButton.data.custom_id === customId) {
                                        newButton.setStyle(newStyle)
                                                 .setLabel(newLabel);
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



        } else {
            message.channel.send('File not found.');
        }
    }
}

     

// Export the function for use in your bot
module.exports = createBus;
