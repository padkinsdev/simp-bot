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
var nsfwChannel = null;

client.on('ready', () => {
    targetServer = client.guilds.resolve(config["simp-server"]);
    simpChannel = targetServer.channels.resolve(config["simp-channel"]);
    nsfwChannel = targetServer.channels.resolve(config["nsfw-channel"]);
    taskLoop = initTasks.initTaskLoop();
    console.log("Up and running!");
});

client.on('message', (message) => {
    if (!(message.channel.id == simpChannel.id || message.channel.type == "dm")) {
        return;
    }
    if (message.content.includes(config["prefix"])) {
        if (message.content.includes("get_members") && message.author.id == config["creator"]) {
            logger.info(`User ${message.author.username} requested member list from channel ${message.channel.id} (${message.channel.name})`);
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
            logger.info(`User ${message.author.username} ping-ponged from channel ${message.channel.id} (${message.channel.name}). Ping was ${client.ws.ping} and gateway was ${client.ws.gateway}`);
            let embed = new discord.MessageEmbed()
            .setTimestamp()
            .setColor(genRandHex())
            .setTitle("Pong!")
            .setDescription(`:clock1: ${client.ws.ping}, :medical_symbol: ${client.ws.status}, :door: ${client.ws.gateway}`);
            message.channel.send(embed);
        } else if (message.content.includes("get_logs") && message.author.id == config["creator"]) {
            logger.info(`User ${message.author.username} requested bot logs from channel ${message.channel.id} (${message.channel.name})`);
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
            logger.info(`${message.author.username} requested guild information for ${targetServer.name} from channel ${message.channel.id} (${message.channel.name})`)
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
            logger.info(`User ${message.author.username} requested user information about themselves from channel ${message.channel.id} (${message.channel.name})`);
            if (message.mentions.members == null || message.mentions.members.array().length < 1) {
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
                        `**Joined At:** ${(member.joinedAt != null) ? member.joinedAt.toUTCString() : "not available"}\n`+
                        `**Display Color:** ${member.displayHexColor}\n`+
                        `**Display Name:** ${member.displayName}\n`+
                        `**Premium Since:** ${(member.premiumSince != null) ? member.premiumSince.toUTCString() : "not premium"}`
                    );
                    message.channel.send(embed);
                })
                .catch((err) => {
                    logger.error(`Error while fetching user ${message.author.username}: ${err}`);
                })
            } else {
                let user = message.mentions.members.array()[0];
                logger.info(`User ${message.author.username} requested user information about user ${user.username} from channel ${message.channel.id} (${message.channel.name})`);
                let embed = new discord.MessageEmbed()
                .setColor(genRandHex())
                .setTimestamp()
                .setThumbnail(user.user.avatarURL())
                .setTitle(`User information for > ${user.user.username} <`)
                .setDescription(
                    `**Bot:** ${user.user.bot}\n`+
                    `**Presence:** ${user.user.presence.status}\n`+
                    `**Avatar URL:** ${user.user.avatarURL({ size: 4096 })}\n`+
                    `**Id:** ${user.user.id}\n`+
                    `**Joined At:** ${(user.joinedAt != null) ? user.joinedAt.toUTCString() : "not available"}\n`+
                    `**Display Color:** ${user.displayHexColor}\n`+
                    `**Display Name:** ${user.displayName}\n`+
                    `**Premium Since:** ${(user.premiumSince != null) ? user.premiumSince.toUTCString() : "not premium"}`
                );
                message.channel.send(embed);
            }
        }
    }
});

client.on('guildMemberRemove', (member) => {
    logger.info(`User ${member.user.username} left guild ${member.guild.name}`);
    if (!(member.guild.id == config["simp-server"])) {
        return;
    }
    let embed = new discord.MessageEmbed()
    .setDescription(`${member.user.username} has left. We'll miss you!`)
    .setColor(genRandHex())
    .setThumbnail("https://i.pinimg.com/originals/3c/de/3e/3cde3e1fe79e02abdc287395f57d8578.gif")
    .setTitle(`${member.user.username} has left...`);
    simpChannel.send(embed);
});

client.on('guildMemberAdd', (member) => {
    logger.info(`User ${member.user.username} joined guild ${member.guild.name}`);
    if (!(member.guild.id == config["simp-server"])) {
        return;
    }
    let embed = new discord.MessageEmbed()
    .setDescription(`${member.user.username} has joined the server. Welcome!`)
    .setColor(genRandHex())
    .setThumbnail("https://media1.tenor.com/images/4db088cfc73a5ee19968fda53be6b446/tenor.gif")
    .setTitle(`${member.user.username} has joined!`);
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
    logger.debug(`Generated random hex: 0x${result}`);
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
    .then(() => {
        logger.debug("Successfully messaged bot creator")
    })
    .catch((dmFailReason) => {
        console.log(`Failed to send DM to creator: ${dmFailReason}`);
    });
}

// Tasks
function getRandomUserToSimp() {
    logger.debug("Finding random user to simp for..");
    s3.listObjectsV2({
        Bucket: config["files-bucket"],
        Prefix: "simp-images/"
    }, (err, list) => {
        if (err) {
            logger.error(`Error while fetching simp images file list: ${err}`);
            return;
        }
        list = list.Contents;
        let imageUrl = `https://faebotwebsite.s3.amazonaws.com/${list[simpUtils.randInt(0, list.length)].Key}`;
        logger.debug(`Image URL for simp embed is ${imageUrl}`);
        simpUtils.getRandomUser(targetServer, true)
        .then((user) => {
            let embed = new discord.MessageEmbed()
            .setDescription(`Simp for <@!${user.id}>!`)
            .setColor(genRandHex())
            .setImage(imageUrl)
            .setTitle("Simp Time!");
            logger.info(`Found random user to simp for: ${user.id} (${user.user.username})`);
            //dmCreator(embed);
            simpChannel.send(embed);
        })
        .catch((err) => {
            logger.error(err);
        });
    });
}

function uploadLogsToCloud() {
    logger.info("Uploading logs to cloud...")
    fs.readdir("./logs", (err, files) => {
        if (err) {
            logger.error(err);
            return;
        }
        files.forEach((file) => {
            let uploadParams = {
                Bucket: config["files-bucket"],
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
                    logger.info(`Successfully uploaded logs to s3 at ${data.Location}`);
                }
            });
        });
    });
}

function remindToDrinkWater() {
    if (simpUtils.randInt(0, 6) != 1) {
        logger.info("Failed to pass drink water check");
        return;
    }
    logger.info("Generating reminder to drink water...");
    s3.listObjectsV2({
        Bucket: config["files-bucket"],
        Prefix: "wholesome-images/"
    }, (err, list) => {
        if (err) {
            logger.error(`Error while fetching wholesome images file list: ${err}`);
            return;
        }
        list = list.Contents;
        let imageUrl = `https://faebotwebsite.s3.amazonaws.com/${list[simpUtils.randInt(0, list.length)].Key}`;
        logger.debug(`Image URL for reminder to drink water is ${imageUrl}`);
        let embed = new discord.MessageEmbed()
        .setColor(genRandHex())
        .setTitle("Drink water! Take your meds!")
        .setDescription("If you haven't had water recently then go drink some! Remember to take breaks, and don't forget that I love you no matter what.")
        .setFooter("Feed me wholesome art! Send art to Kate if you want it to be included in the image pool!")
        .setImage(imageUrl);
        simpChannel.send(embed);
        //dmCreator(embed);
    });
}

function getRandomRelationshipImage() {
    if (simpUtils.randInt(0, 24) != 1) {
        logger.info("Failed to pass relationship image spawn check");
        return;
    }
    logger.info("Fetching random relationship image...");
    s3.listObjectsV2({
        Bucket: config["files-bucket"],
        Prefix: "relationship-images/"
    }, (err, list) => {
        if (err) {
            logger.error(`Error while fetching relationship images file list: ${err}`);
            return;
        }
        list = list.Contents;
        let imageUrl = `https://faebotwebsite.s3.amazonaws.com/${list[simpUtils.randInt(0, list.length)].Key}`;
        logger.debug(`Image URL for relationship image is ${imageUrl}`);
        let embed = new discord.MessageEmbed()
        .setColor(genRandHex())
        .setTitle(`Some serotonin for your troubles?`)
        .setDescription("Bonus serotonin if you can identify what fandom/series the art is from :grin:. These are being sent to the nsfw channel just to be safe")
        .setFooter("Feed me relationship art! Send art to Kate if you want it to be included in the image pool!")
        .setImage(imageUrl);
        nsfwChannel.send(embed);
    });
}

// Exports

exports.client = client;
exports.logger = logger;
exports.tasks = [
    new Task("simp generator", 21600000, getRandomUserToSimp),
    new Task("upload logs to cloud", 10800000, uploadLogsToCloud),
    new Task("remind everyone to drink water", 10800000, remindToDrinkWater),
    new Task("fetch random relationship image", 3600000, getRandomRelationshipImage)
];