const https = require('https');
const fs = require('fs');
const path = require('path');

const ranks = [
  'iron', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'challenger'
];

const targetDir = path.join(__dirname, 'public', 'ranks');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

ranks.forEach(rank => {
  const url = `https://raw.communitydragon.org/12.1/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${rank}.png`;
  const filePath = path.join(targetDir, `emblem-${rank}.png`);
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${rank}`);
      });
    } else {
      console.log(`Failed to download ${rank}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`Error on ${rank}:`, err.message);
  });
});
