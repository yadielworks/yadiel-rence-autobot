const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

module.exports = {
  name: 'gore',
  description: 'Fetch random gore content',
  usage: '',
  nashPrefix: false,
  async execute(api, event, args, prefix) {
    try {
      api.sendMessage('🎥 Fetching random gore content...', event.threadID);

      const apiUrl = 'https://nash-rest-api.vercel.app/gore';

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data && data.video1) {
        const { title, source, video1, video2 } = data;
        
        let message = `🎥 Title: ${title}\n`;
        message += `🔗 Source: ${source}\n`;
        message += `📹 Video 1: ${video1}\n`;
        if (video2) {
          message += `📹 Video 2: ${video2}\n`;
        }
        
        const videoUrl = video1;
        const videoPath = path.join(__dirname, 'gore.mp4');
        
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        await writeFileAsync(videoPath, videoResponse.data);
        
        api.sendMessage({ attachment: fs.createReadStream(videoPath) }, event.threadID, async () => {
          try {
            await unlinkAsync(videoPath);
          } catch (err) {
            console.error('Error deleting temporary file:', err);
          }
        });
      } else {
        api.sendMessage('🎥 No gore content found.', event.threadID);
      }
    } catch (error) {
      console.error('Error executing command:', error.message || error);
      api.sendMessage('An error occurred while executing the command.', event.threadID);
    }
  },
};