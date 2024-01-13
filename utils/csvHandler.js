const fs = require('fs');
const path = require('path');
const https = require('https');
const Papa = require('papaparse');
const axios = require('axios');


//Save a CSV file
const saveCSV = async (interaction, fileName, fileUrl) => {
    const filePath = path.join(__dirname, '..', 'CSVs', `${fileName}.csv`);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
        https.get(fileUrl, function(response) {
            response.pipe(fileStream);
            fileStream.on('finish', function() {
                fileStream.close();
                resolve(`File saved as ${fileName}.csv`);
            });
        }).on('error', function(err) {
            fs.unlink(filePath);
            reject('Error saving the file: ' + err.message);
        });
    });
};

//List all CSV Files
const listCSVFiles = () => {
    const directoryPath = path.join(__dirname, '..', 'CSVs');
    try {
        const files = fs.readdirSync(directoryPath);
        const csvFiles = files.filter(file => file.endsWith('.csv'));

        if (csvFiles.length === 0) {
            return 'No CSV files found.';
        }

        let fileListMessage = 'CSV Files:\n';
        csvFiles.forEach(file => {
            fileListMessage += `- ${file}\n`;
        });

        return fileListMessage;
    } catch (err) {
        return 'Error reading directory: ' + err.message;
    }
};

// Delete a CSV file
const deleteCSV = (fileName) => {
    const filePath = path.join(__dirname, '..', 'CSVs', fileName);
    if (!fs.existsSync(filePath)) {
        return 'File not found.';
    }

    try {
        fs.unlinkSync(filePath);
        return `File ${fileName} deleted successfully.`;
    } catch (err) {
        return 'Error deleting file: ' + err.message;
    }
};

// Read the CSV and Returns with important information
const readCSV = async (fileName) => {
    const filePath = path.join(__dirname, '..', 'CSVs', `${fileName}.csv`);
    if (!fs.existsSync(filePath)) {
        return 'File not found.';
    }

    try {
        const csvData = fs.readFileSync(filePath, 'utf8');
        let parsedData = Papa.parse(csvData, { header: true }).data;

        const originalRowCount = parsedData.length;

        parsedData = parsedData.filter(row => {
            const amountRefunded = parseFloat(row['Amount Refunded']);
            return isNaN(amountRefunded) || amountRefunded <= 0;
        });

        const removedRowCount = originalRowCount - parsedData.length;
        console.log(`Rows removed due to refund: ${removedRowCount}`);

        // Check if all "Lineitem variant" fields are empty
        const allVariantsEmpty = parsedData.every(row => {
            return !row['Lineitem variant'] || !row['Lineitem variant'].trim();
        });

        let totalRevenue = 0;
        const variantCounts = parsedData.reduce((acc, row) => {
            const variant = row['Lineitem variant'] && row['Lineitem variant'].trim() ? row['Lineitem variant'] : row['Lineitem name'];
            const quantity = parseInt(row['Lineitem quantity'], 10);
            const price = parseFloat(row['Lineitem price']);
            
            if (!variant || isNaN(quantity) || isNaN(price)) {
                console.log('Invalid row:', row);
                return acc;
            }
            
            if (!acc[variant]) {
                acc[variant] = { quantity: 0, revenue: 0 };
            }

            acc[variant].quantity += quantity;
            acc[variant].revenue += price * quantity;
            totalRevenue += price * quantity;
            
            return acc;
        }, {});

        let responseMessage = '';
        for (const [variant, data] of Object.entries(variantCounts)) {
            responseMessage += `"${variant}": ${data.quantity} tickets, $${data.revenue.toFixed(2)}\n`;
        }
        responseMessage += `Total Revenue: $${totalRevenue.toFixed(2)}`;

        return responseMessage;
    } catch (err) {
        return 'Error reading file: ' + err.message;
    }
};

const updateCSV = async (originalFileName, newFileUrl) => {
    const existingFilePath = path.join(__dirname, '..', 'CSVs', `${originalFileName}.csv`);
    const tempFilePath = path.join(__dirname, '..', 'CSVs', 'temp.csv'); // Temporary file path for the new CSV

    try {
        // Download the new CSV file and write it to tempFilePath
        const response = await axios.get(newFileUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempFilePath, response.data);

        // Read and parse the existing CSV
        const existingData = fs.readFileSync(existingFilePath, 'utf8');
        let existingEntries = Papa.parse(existingData, { header: true, skipEmptyLines: true }).data;

        // Convert existing entries to a map for easy lookup
        const existingMap = new Map(existingEntries.map(entry => [entry['Order ID'], entry]));

        // Read and parse the new CSV from tempFilePath
        const newData = fs.readFileSync(tempFilePath, 'utf8');
        const newEntries = Papa.parse(newData, { header: true, skipEmptyLines: true }).data;

        // Process new entries and count the additions
        let newEntriesCount = 0;
        for (const newEntry of newEntries) {
            if (!existingMap.has(newEntry['Order ID'])) {
                existingEntries.push(newEntry); // Append new entry
                newEntriesCount++; // Increment the count of new entries
            }
            // Optionally handle updates to existing entries if needed
        }

        // Convert updated entries back to CSV
        const updatedCSV = Papa.unparse(existingEntries);

        // Clean up: delete the temporary new CSV file
        fs.unlinkSync(tempFilePath);

        // Write updated CSV back to file
        fs.writeFileSync(existingFilePath, updatedCSV, 'utf8');

        return `${newEntriesCount} new entries added to the CSV.`;
    } catch (err) {
        console.error(err);
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath); // Clean up temp file in case of error
        }
        return 'Error updating CSV: ' + err.message;
    }
};

const transferTicket = async (csvName, orderId, buyerName, buyerEmail, buyerPhone) => {
    const filePath = path.join(__dirname, '..', 'CSVs', `${csvName}.csv`);

    try {
        // Read and parse the CSV
        const csvData = fs.readFileSync(filePath, 'utf8');
        let entries = Papa.parse(csvData, { header: true, skipEmptyLines: true }).data;

        // Find and update the specific entry
        let entryFound = false;
        for (let entry of entries) {
            if (entry['Order ID'] === orderId) {
                entryFound = true;
                entry['Product Form: Ticket Holder\'s Email'] = buyerEmail;
                entry['Product Form: Ticket Holder\'s Name'] = buyerName;
                entry['Billing Name'] = buyerName;
                entry['Product Form: Ticket Holder\'s Phone'] = buyerPhone;
                entry['Product Form: What year are you in?'] = "Ticket-Transfer";
                // Break after updating the entry
                break;
            }
        }

        if (!entryFound) {
            return 'Order ID not found.';
        }

        // Convert updated entries back to CSV
        const updatedCSV = Papa.unparse(entries);

        // Write updated CSV back to file
        fs.writeFileSync(filePath, updatedCSV, 'utf8');

        return 'Ticket transfer completed successfully.';
    } catch (err) {
        console.error(err);
        return 'Error processing ticket transfer: ' + err.message;
    }
};

// You can add more functions here for editing CSV files as needed.

module.exports = {
    saveCSV,
    listCSVFiles,
    deleteCSV,
    readCSV,
    updateCSV,
    transferTicket,
    // Export other functions as needed.
};