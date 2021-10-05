'use strict';
const fs = require('fs');
const { Client, Location } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');
var base64ToImage = require('base64-to-image');
const ObjectsToCsv = require('objects-to-csv');


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
    console.log('Client was logged out 🙁 ', reason);
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

        let row = {};
        row.from = trimNumber(message.author);
        row.timestamp = message.timestamp;
        const date = new Date(message.timestamp * 1000);
        row.datetime = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " +
            date.getHours() + ":" + date.getMinutes();
        row.message = message.body;
        row.media = message.hasMedia;
        row.type = "new";
        if (message.hasMedia) {
            const media = await message.downloadMedia();
            const base64Str = 'data:image/jpg;base64,'.concat(media.data);

            const file = fileName();
            row.file = `${file}.jpg`;
            const options = { 'fileName': file, 'type': 'jpg' };
            base64ToImage(base64Str, media_path, options);
        }

        // hasQuotedMsg
        if (message.hasQuotedMsg) {
            row.type = "reply";
            let quotedMsg = await message.getQuotedMessage();
            console.log(quotedMsg)
        }

        new ObjectsToCsv([row]).toDisk('./csv/whatsapp.csv', { append: true });
    }
});

