const fs = require('fs');
const { Client, Location } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
var base64ToImage = require('base64-to-image');

const SESSION_FILE_PATH = './session.json';
const media_path = "./media/";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
// const client = new Client({ puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }, session: sessionCfg });

client.initialize();

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    // console.log('AUTHENTICATED', session);
    sessionCfg = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Whatsapp bot is ready 😃');
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

const trimNumber = (numStr) => {
    return numStr.substring(0, numStr.indexOf('@'));
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const fileName = () => {
    let result = '';
    for (var i = 0; i < 10; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            characters.length - 1));
    }
    return result;
}

client.on("message", async (message) => {
    let chat = await message.getChat();
    // if (chat.isGroup && chat.groupMetadata.creation == 1465194455) { // for office group

    if (chat.isGroup && chat.groupMetadata.creation == 1602851606) { // for test group
        console.log(message)
        // console.log(`from : ${trimNumber(message.author)}`);
        // console.log(`timestamp : ${message.timestamp}`);
        // console.log(`datetime : ${new Date(message.timestamp * 1000)}`);
        // console.log(`body : ${message.body}`);
        // console.log(`has media : ${message.hasMedia}`);

        // image file

        if (message.hasMedia) {
            const media = await message.downloadMedia();
            const base64Str = 'data:image/jpg;base64,'.concat(media.data);

            const file = fileName();
            const options = { 'fileName': file, 'type': 'jpg' };
            base64ToImage(base64Str, media_path, options);
        }

        // hasQuotedMsg
        if (message.hasQuotedMsg) {
            let quotedMsg = await message.getQuotedMessage();
            console.log(quotedMsg)
        }
    }
});
