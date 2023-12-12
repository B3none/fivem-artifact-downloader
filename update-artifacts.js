const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { extractFull } = require('node-7z');

const BASE_URL = 'https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/';

axios.get(BASE_URL)
  .then(async (response) => {
    const html = response.data;
    const activeLink = html.match(/<a\s+class="panel-block\s+is-active"\s+href="([^"]+)"/);

    if (activeLink && activeLink[1]) {
      const fileURL = BASE_URL + activeLink[1].replace('./', '');

      // Adjusting the destination path to the parent directory
      const parentDestinationFolder = path.join(__dirname, '../cfx-server');
      const fileName = path.basename(fileURL);
      const filePath = path.join(parentDestinationFolder, fileName);

      // Create the folder if it doesn't exist
      if (!fs.existsSync(parentDestinationFolder)) {
        fs.mkdirSync(parentDestinationFolder);
      }

      // Download the file
      const writer = fs.createWriteStream(filePath);
      const fileResponse = await axios({
        method: 'get',
        url: fileURL,
        responseType: 'stream'
      });
      fileResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`Downloaded file: ${filePath}`);

      // Extract the .7z file
      await extractFull(filePath, parentDestinationFolder, {
        $progress: true // This enables progress events
      });

      console.log('Extraction complete.');
    } else {
      console.log('Active link not found');
    }
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });
