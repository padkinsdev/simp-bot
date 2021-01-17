const discord = require('discord.js');
const fs = require('fs');
const aws = require('aws-sdk');

const config = require('./config.json');
const simpUtils = require('./src/util/simp-utils');
const initTasks = require('./src/scheduling/init-task-loop');
const logging = require('./src/util/logging');
const Task = require('./src/util/task').Task;

aws.config.update({
    region: "us-east-1"
});

aws.config.credentials = {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
}

const botIntents = new discord.Intents([discord.Intents.NON_PRIVILEGED, discord.Intents.FLAGS.GUILD_MEMBERS]);
const logger = new logging.Logger();

const client = new discord.Client({
    ws: {
        intents: botIntents
    }
});
const s3 = new aws.S3();

var targetServer = null;
var simpChannel = null;

client.on('ready', () => {
    targetServer = client.guilds.resolve(config["simp-server"]);
    simpChannel = targetServer.channels.resolve(config["simp-channel"]);
    taskLoop = initTasks.initTaskLoop();
    console.log("Up and running!");
});

client.on('message', (message) => {
    if (!(message.channel.id == simpChannel.id || message.channel.type == "dm")) {
        return;
    }
    if (message.content.includes(config["prefix"])) {
        if (message.content.includes("get_members") && message.author.id == config["creator"]) {
            simpUtils.stringifyMembers(targetServer)
            .then((members) => {
                let embed = new discord.MessageEmbed()
                .setDescription(`${members}`)
                .setColor(genRandHex())
                .setThumbnail(config["command-img-url"])
                .setTitle(`Users`);
                message.channel.send(embed);
            })
            .catch((error) => {
                message.channel.send(`Error while fetching users: ${error}`);
            })
        } else if (message.content.includes("ping")) {
            let embed = new discord.MessageEmbed()
            .setTimestamp()
            .setColor(genRandHex())
            .setTitle("Pong!")
            .setDescription(`:clock1: ${client.ws.ping}, :medical_symbol: ${client.ws.status}, :door: ${client.ws.gateway}`);
            message.channel.send(embed);
        } else if (message.content.includes("get_logs") && message.author.id == config["creator"]) {
            let logText = "";
            fs.readdir('./logs', (err, files) => {
                if (err) {
                    dmCreator(`Error while reading log files: ${err}`);
                    return;
                }
                if (files.length < 1) {
                    dmCreator("No logs to display");
                    return;
                }

                let fullPath = [];
                files.forEach((file) => {
                    fullPath.push(`./logs/${file}`);
                });

                let embed = new discord.MessageEmbed()
                .setTimestamp()
                .attachFiles(fullPath)
                .setColor(genRandHex())
                .setTitle("Bot Logs")
                .setDescription(logText);
                dmCreator(embed);
            });
        } else if (message.content.includes("guild_stats") && (message.author.id == config["creator"] || message.author.id == "618320455287177241")) {
            let embed = new discord.MessageEmbed()
            .setTimestamp()
            .setTitle(`Guild stats for > ${targetServer.name} <`)
            .setColor(genRandHex())
            .setThumbnail(targetServer.iconURL())
            .setDescription(
            `**Owner:** ${targetServer.owner.user.username}\n`+
            `**Number of members:** ${targetServer.memberCount}\n`+
            `**Premium Tier:** ${targetServer.premiumTier}\n`+
            `**Created At:** ${targetServer.createdAt.toUTCString()}\n`+
            `**Default Notification Level:** ${targetServer.defaultMessageNotifications}\n`+
            `**Description:** ${targetServer.description}\n`+
            `**MFA Level:** ${targetServer.mfaLevel}\n`+
            `**Region:** ${targetServer.region}\n`+
            `**Highest Role:** ${targetServer.roles.highest.name}, with color ${targetServer.roles.highest.hexColor}`
            );
            message.channel.send(embed);
        } else if (message.content.includes("member_stats")) {
            if (message.mentions.members.array().length < 1) {
                // Get info about message author
                targetServer.members.fetch(message.author)
                .then((member) => {
                    let embed = new discord.MessageEmbed()
                    .setColor(genRandHex())
                    .setTimestamp()
                    .setThumbnail(message.author.avatarURL())
                    .setTitle(`User information for > ${message.author.username} <`)
                    .setDescription(
                        `**Bot:** ${message.author.bot}\n`+
                        `**Presence:** ${message.author.presence.status}\n`+
                        `**Avatar URL:** ${message.author.avatarURL({ size: 4096 })}\n`+
                        `**Id:** ${message.author.id}\n`+
                        `**Joined At:** ${member.joinedAt.toUTCString()}\n`+
                        `**Display Color:** ${member.displayHexColor}\n`+
                        `**Display Name:** ${member.displayName}`+
                        `**Premium Since:** ${member.premiumSince.toUTCString()}`
                    );
                    message.channel.send(embed);
                })
                .catch((err) => {
                    logger.error(`Error while fetching user ${message.author.username}: ${err}`);
                })
            }
        }
    }
});

client.on('guildMemberRemove', (member) => {
    if (!(member.guild.id == config["simp-server"])) {
        return;
    }
    let embed = new discord.MessageEmbed()
    .setDescription(`${member.nickname} has left. We'll miss you!`)
    .setColor(genRandHex())
    .setThumbnail("https://i.pinimg.com/originals/3c/de/3e/3cde3e1fe79e02abdc287395f57d8578.gif")
    .setTitle(`${member.nickname} has left...`);
    simpChannel.send(embed);
});

client.on('guildMemberAdd', (member) => {
    if (!(member.guild.id == config["simp-server"])) {
        return;
    }
    let embed = new discord.MessageEmbed()
    .setDescription(`${member.nickname} has joined the server. Welcome!`)
    .setColor(genRandHex())
    .setThumbnail("https://media1.tenor.com/images/4db088cfc73a5ee19968fda53be6b446/tenor.gif")
    .setTitle(`${member.nickname} has joined!`);
    simpChannel.send(embed);
});

client.login(config['token']);

// Error handling

process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err}`);
});

process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err}`);
})

// Utility functions

function genRandHex() {
    let result = "";
    let characters = "0123456789ABCDEF";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '0x' + result;
}

function dmCreator(content) {
    targetServer.members.fetch(config['creator'])
    .then((user) => {
        return user.createDM();
    })
    .then((dmChannel) => {
        dmChannel.send(content);
    })
    .catch((dmFailReason) => {
        console.log(`Failed to send DM to creator: ${dmFailReason}`);
    });
}

// Tasks
function getRandomUserToSimp() {
    simpUtils.getRandomUser(targetServer, true)
    .then((user) => {
        let embed = new discord.MessageEmbed()
        .setDescription(`Simp for <@!${user.id}>!`)
        .setColor(genRandHex())
        .setImage("https://faebotwebsite.s3.amazonaws.com/files/20200904_125435.jpg")
        .setTitle("Simp Time!");
        simpChannel.send(embed);
    })
    .catch((err) => {
        logger.error(err);
    })
}

function uploadLogsToCloud() {
    fs.readdir("./logs", (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        files.forEach((file) => {
            let uploadParams = {
                Bucket: "faebotwebsite",
                Key: "simp-bot-logs",
                Body: ""
            };
            let fileStream = fs.createReadStream(`./logs/${file}`);
            fileStream.on("error", (err) => {
                console.log(`Error while reading file ${path}: ${err}`);
            });
            uploadParams.Body = fileStream;
            uploadParams.Key = file;
            s3.upload(uploadParams, (err, data) => {
                if (err) {
                    logger.error(`Error while uploading to s3: ${err}`);
                } else {
                    logger.info(`Successfully uploaded to s3 at ${data.Location}`);
                }
            });
        });
    });
}

// Exports

exports.client = client;
exports.logger = logger;
exports.tasks = [
    new Task("simp generator", 10800000, getRandomUserToSimp),
    new Task("upload logs to cloud", 3600000, uploadLogsToCloud)
];