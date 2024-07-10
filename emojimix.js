const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'emojimix',
  description: 'Mixes two emojis to create a new one.',
  usage: '[ 💬 𝗨𝘀𝗮𝗴𝗲 💬 ]\n\n🔹 Example: [ 💬 ${prefix}emojimix 😄 😂 💬 ]',
  rencePrefix: false,
  execute(api, event, args, prefix) {
    try {
      if (args.length < 2) {
        const usageMessage = `
🔮 𝗘𝗺𝗼𝗝𝗶 𝗠𝗶𝘅 🔮

━━━━━━━━━━━━━━━━━━━
💬 𝗨𝘀𝗮𝗴𝗲 💬

🔹 ${prefix}emojimix [emoji1] [emoji2]

🔹 Example:
🔹 ${prefix}emojimix 😄 😂
━━━━━━━━━━━━━━━━━━━
        `;
        api.sendMessage(usageMessage, event.threadID);
        return;
      }

      const emoji1 = encodeURIComponent(args[0]);
      const emoji2 = encodeURIComponent(args[1]);
      const apiUrl = `https://nash-rest-api.vercel.app/emojimix`;

      api.sendMessage('🔍 Processing your emoji mix...', event.threadID);

      axios.get(apiUrl, { params: { one: emoji1, two: emoji2 } })
        .then(async response => {
          const data = response.data;
          if (data && data.results && data.results.length > 0) {
            const result = data.results[0];
            const imageUrl = result.media_formats.png_transparent.url;
            const filePath = path.join(__dirname, 'emojimix/temp_emoji_mix.png');
            
            const responseImage = await axios({
              url: imageUrl,
              method: 'GET',
              responseType: 'stream',
            });
            const writer = fs.createWriteStream(filePath);
            responseImage.data.pipe(writer);

            writer.on('finish', () => {
              api.sendMessage({
                body: `
🔮 𝗘𝗺𝗼𝗝𝗶 𝗠𝗶𝘅 🔮

━━━━━━━━━━━━━━━━━━━
🔹 Resulting Emoji:

🔹 Tags: ${result.tags.join(', ')}
━━━━━━━━━━━━━━━━━━━
                `,
                attachment: fs.createReadStream(filePath),
              }, event.threadID);
            });

            writer.on('error', (error) => {
              console.error('Error writing file:', error.message || error);
              api.sendMessage('⚠️ An error occurred while saving the image.', event.threadID);
            });
          } else {
            throw new Error('No results found');
          }
        })
        .catch(error => {
          console.error('Error fetching emoji mix data:', error.message || error);
          api.sendMessage('⚠️ An error occurred while fetching the emoji mix data.', event.threadID);
        });
    } catch (error) {
      console.error('Error executing command:', error.message || error);
      api.sendMessage('⚠️ An error occurred while executing the command.', event.threadID);
    }
  },
};