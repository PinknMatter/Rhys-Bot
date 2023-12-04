    const Papa = require('papaparse');
    const fs = require('fs');
    const axios = require('axios');
    // CSV PARSING
    async function parseCSV(message){

        const roleName = "Executives";
        const member = message.member;
        const executivesRole = message.guild.roles.cache.find(role => role.name === roleName);

        if (!executivesRole || !member.roles.cache.has(executivesRole.id)) {
            message.channel.send("Sorry, you need to have the 'Executives' role to use this command.");
            return;
        }
        // Check if the message has an attachment
        if (message.attachments.size > 0) {
            if (message.attachments.size > 0) {
                const attachment = message.attachments.first();
                const filePath = './temp.csv'; // Temporary file path
    
                // Download the CSV file
                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                fs.writeFileSync(filePath, response.data);
    
                // Read the CSV file
                const csvData = fs.readFileSync(filePath, 'utf8');
                
                // Parse the CSV file using PapaParse
                const parsedData = Papa.parse(csvData, { header: true }).data;

                // Check if all "Lineitem variant" fields are empty
                const allVariantsEmpty = parsedData.every(row => {
                    return !row['Lineitem variant'] || !row['Lineitem variant'].trim();
                });
    
                // Process the data (aggregating and calculating as needed)
                let totalRevenue = 0;
                const variantCounts = parsedData.reduce((acc, row) => {
                    // Use "Lineitem variant" or fallback to "Lineitem name"
                    const variant = (row['Lineitem variant'] && row['Lineitem variant'].trim()) ? row['Lineitem variant'] : row['Lineitem name'];
                    const quantity = parseInt(row['Lineitem quantity'], 10);
                    const price = parseFloat(row['Lineitem price']);
                
                    // Check for valid data
                    if (!variant || isNaN(quantity) || isNaN(price)) {
                        // Optionally, log the invalid row for debugging
                        console.log('Invalid row:', row);
                        return acc; // Skip this row
                    }
                
                    if (!acc[variant]) {
                        acc[variant] = { quantity: 0, revenue: 0 };
                    }
                
                    acc[variant].quantity += quantity;
                    acc[variant].revenue += price * quantity;
                    totalRevenue += price * quantity;
                
                    return acc;
                }, {});
                
                // Construct the response message
                let responseMessage = '';
                for (const [variant, data] of Object.entries(variantCounts)) {
                    responseMessage += `"${variant}": ${data.quantity} tickets, $${data.revenue.toFixed(2)}\n`;
                }
                responseMessage += `Total Revenue: $${totalRevenue.toFixed(2)}`;
    
                // Send the response message
                message.channel.send(responseMessage);
    
                // Clean up the temporary file
                fs.unlinkSync(filePath);
        } else {
            message.channel.send('Please attach a CSV file with the command.');
        }
    }

}

module.exports = parseCSV;
