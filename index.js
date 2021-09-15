const fs = require('fs');
const { Client, Location } = require('whatsapp-web.js');
const { MessageMedia } = require('whatsapp-web.js');


const SESSION_FILE_PATH = './session.json';
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
    console.log('AUTHENTICATED', session);
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
    console.log('BOT READY');
});

// function to send messages
async function send_message(number, message, res) {
    try {
        var chatId = number.substring(1) + "@c.us";
        await client.sendMessage(chatId, message);
        return res.status(200).json({ "message": "Whatsapp message sent!!" });
    }
    catch (e) {
        return res.status(400).json({ "message": "Failed sending message, Make sure your phone has an active internet connection!!" });
    }
}

// function to send pdf
async function send_pdf(number, pdf, name, res) {
    try {
        var chatId = number.substring(1) + "@c.us";
        const media = new MessageMedia('application/pdf', pdf, name);
        var chatId = number.substring(1) + "@c.us";
        await client.sendMessage(chatId, media); //attachments
        return res.status(200).json({ "message": "Whatsapp pdf sent!!" });
    }
    catch (e) {
        return res.status(400).json({ "message": "Failed sending pdf, Make sure your phone has an active internet connection!!" });
    }
}

async function send_csv(number, csv, name, res) {
    try {
        var chatId = number.substring(1) + "@c.us";
        const media = new MessageMedia('text/csv', csv, name);
        var chatId = number.substring(1) + "@c.us";
        await client.sendMessage(chatId, media); //attachments
        return res.status(200).json({ "message": "Whatsapp pdf sent!!" });
    }
    catch (e) {
        return res.status(400).json({ "message": "Failed sending csv, Make sure your phone has an active internet connection!!" });
    }
}

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.on("message", async (message) => {
    let chat = await message.getChat();
    if (chat.isGroup && chat.groupMetadata.creation == 1465194455) {
        console.log(`from : ${message.from}`);
        console.log(`timestamp : ${message.timestamp}`);
        console.log(`body : ${message.body}`);
        console.log(`has media : ${message.hasMedia}`);
    }
});