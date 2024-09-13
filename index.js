import fs from 'node:fs/promises';
import axios from 'axios';

const filePath = './imagefile.json';

async function fetchData() {
  try {
    const response = await axios.get('https://api.memegen.link/images/');
    const data = response.data;
    console.log(data);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Data saved to', filePath);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching data:', error);
  }
}
async function readFile() {
  try {
    const data = await fs.readFile('imagefile.json', 'utf8');
    const parsedData = JSON.parse(data);
    console.log('Read data from file:', parsedData);

    // Extract every 1st, 3rd, 5th, etc. URL (0-based index: 0, 2, 4, 6, 8, ...)
    const urls = parsedData
      // this filter selects the 1.,3.,5. and so on
      .filter((unused, index) => index % 2 === 0)
      // the slice ensures i get only the first 10
      .slice(0, 10)
      // .(map) Transforms each item in an array
      // .(item) => item.url: Extracts the url property from each object.
      .map((item) => item.url);
    console.log('Filtered URLs:', urls);
    return urls;
  } catch (error) {
    // Handle any errors
    console.error('Error reading data:', error);
    return []; // Return an empty array in case of error
  }
}

async function downloadImages(urls) {
  // Iterate over each URL in the `urls` array
  for (const [index, url] of urls.entries()) {
    try {
      // Send a GET request to the URL, requesting the image data as an array buffer
      const response = await axios.get(url, { responseType: 'arraybuffer' });

      // Construct the path where the image will be saved
      // `index + 1` gives a 1-based index (e.g., 1, 2, 3, ...)
      // `padStart(2, '0')` ensures that single-digit numbers have a leading zero (e.g., '01', '02')
      const imagePath = `./memes/${String(index + 1).padStart(2, '0')}.jpg`;

      // Write the image data to the file path
      await fs.writeFile(imagePath, response.data);

      // Log a message to confirm the image was saved
      console.log(`Image ${index + 1} saved to ${imagePath}`);
    } catch (error) {
      // If there's an error, log it
      console.error(`Error downloading image ${index + 1}:`, error);
    }
  }
}

async function main() {
  await fetchData();
  const urls = await readFile();
  if (urls && urls.length > 0) {
    await downloadImages(urls);
  } else {
    console.error('No URLs to download.');
  }
}

main().catch((error) => {
  console.error('An error occurred in main():', error);
});
