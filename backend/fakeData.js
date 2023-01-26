const databasepg = require('./modules/databasepg');
const path = require('path');
const fs = require('fs');


/**
 * This function is used to insert fake coordinates in the database
 */
async function insertFakeCoordinates(fileName) {
    const dirPath = path.join(__dirname, "./files");
    if(fs.existsSync(dirPath)) {
        try {
            const filePath = path.join(dirPath, fileName);
            const fakeCoordinates = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            for (let i = 0; i < fakeCoordinates.length; i++) { //for each zone
                for(let j = 0; j < fakeCoordinates[i].length; j++) { //for each coordinate
                    console.log(`Inserting ${j+1}/${fakeCoordinates[i].length} in zone ${i+1}`);
                    await databasepg.insert_activity('ENTERING', fakeCoordinates[i][j]);
                };
            }
        } catch(err) {
            console.error('File not found');
        }
    }
    else
        console.error("Dir not found");
}

//createCoordinates();
insertFakeCoordinates('fake_coordinates.json');    