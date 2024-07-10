const axios = require('axios');

module.exports = {
  name: 'pogisiterrence',
  description: 'Send a random video with a message',
  usage: '[rencePrefix]pogisigena',
  rencePrefix: true,
  execute: async (api, event, args, prefix) => {
    try {
      await api.sendMessage('wait lang hindi maka antay ampota HAHAHA', event.threadID);

      const API_SERVER_URL = 'https://pogi-sige-api.onrender.com';

      const response = await axios.get(`${API_SERVER_URL}/api/pogi`);
      const videoUrls = response.data;

      const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

      const videoStreamResponse = await axios.get(randomVideoUrl, { responseType: 'stream' });

      const message = {
        body: 'Pogi sige na',
        attachment: videoStreamResponse.data,
      };

      await api.sendMessage(message, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error fetching or sending the video:', error);
      await api.sendMessage('Error sending the video.', event.threadID);
    }
  }
};