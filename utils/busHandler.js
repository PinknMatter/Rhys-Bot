const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const processBusCSV = async (filename) => {
    const filePath = path.join(__dirname, '..', 'CSVs', `${filename}.csv`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found at path: ${filePath}`);
    }

    try {
        const csvData = fs.readFileSync(filePath, 'utf8');

        // Parse the CSV data
        const parsedResult = Papa.parse(csvData, { header: true, skipEmptyLines: true });

        // Check for parsing errors
        if (parsedResult.errors.length > 0) {
            console.error('Errors encountered during CSV parsing:', parsedResult.errors);
            throw new Error('Error parsing CSV file.');
        }

        // Check if data is present
        if (parsedResult.data.length === 0) {
            throw new Error('No data found in CSV file.');
        }

        // Process and return the bus list
        return parsedResult.data.map(row => ({
            name: row['Product Form: Ticket Holder\'s Name'] || 'Unknown Name',
            phoneNumber: row['Product Form: Ticket Holder\'s Phone'] || 'Unknown Phone Number',
            ticketType: row['Lineitem variant'] || 'All',
            checkedIn: false
        })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error processing the CSV file:', error);
        throw error; // Rethrow the error to handle it in the calling context
    }
};

module.exports = { processBusCSV };
