const discord = require('discord.js');
const config = require('./config.json');

const simpDelay = 3600000;
const client = new discord.Client();
const simpRecipients = [
    "621357020808740924", // Neptune
    "293841274639745025", // Mercury/Deep
    "215249462665281536", // Venus/Gert
    "359196366171537410", // Pluto
    "618320455287177241", // Saturn/Mich
    "204035386689716225", // Artemis/Kate
    "317377671598178304", // corot-7b
    "544919325417537570", // Brit(ney)
    "136265284695621632", // satsui no thotto
    "758888232200568892", // LVIes/Ceres
    "691353290558013530", // T
    "223118324475625472", // HaydenGotBored
    "143077292938100737", // Ligondy
    "402615865620561920", // Wretched Brat
    //"360130321691443200", // CannibalKin
    "249123434645159936", // Orion
    "572283494193954817", // Jupiter/Nikkie/Nikhil
    "486341657869156353", // Mars
    "317459110218170369", // Nix
    "755618328818614312", // Uranus
    "324216151628447744", // Finnn
    "763601080289591317", // Scorpius
    "571152848050454528", // Zen
    "200391075230253057", // Liz H
    "751646796790366298" // MissJ
];

const fightLines = [
    "I hope you're ready to get your ass whooped by a bot :angry:",
    "I've been wanting to try out my new knuckledusters :smiling_imp:",
    "Is this...love?",
    "LET'S GOOOOOOOOOOOOOOOOOOO",
    "How about a pleasant game of bridge instead? :face_with_monocle:",
    "The sexual tension is *overwhelming*",
    "Fight you? Please. You wish I would.",
    "I am but a simple bot, tending to my cyclomatic complexity :pensive:"
];

var userMsgCount = new Map();
var hourCounter = 0;
var targetServer, simpChannel;
var infiniteLoop = false;

client.on('ready', () => {
    targetServer = client.guilds.resolve(config["simp-server"]);
    simpChannel = targetServer.channels.resolve(config["simp-channel"]);
    console.log("I'm alive!");
    setInterval(() => {
        let leaderboard = generateLeaderboard();
        let embed = new discord.MessageEmbed()
            .setDescription(leaderboard)
            .setColor(genRandHex())
            .setThumbnail("https://i2.wp.com/pa1.narvii.com/6119/bd51869c9e3bb834571359421c78495c421e7b03_hq.gif")
            .setTitle("Leaderboard");
        dmCreator(embed);
    }, 1200000);
    setInterval(() => {
        hourCounter++;
        if (hourCounter % 3 == 0) {
            let cache = "";
            targetServer.members.cache.array().forEach((val) => {
                cache += `${val.nickname}, `;
            });
            targetServer.members.fetch()
                .then((members) => {
                    let embed = new discord.MessageEmbed()
                        .setColor(genRandHex())
                        .setThumbnail("https://faebotwebsite.s3.amazonaws.com/files/20200904_125435.jpg")
                        .setTitle("Wake And Bake, It's Simp Time!");
                    members = members.array();
                    let userToSimp = members[Math.floor(Math.random() * members.length)];
                    if (simpRecipients.includes(userToSimp.id)) {
                        embed.setDescription(`Today's task:\nSimp for ${targetServer.members.resolve(userToSimp.id)}`);
                    } else {
                        embed.setDescription(`Today's task:\nSimp for <@!${targetServer.members.resolve(simpRecipients[Math.floor(Math.random() * simpRecipients.length)])}>\n\nP.S.: Tell Kate to come fix me :medical_symbol:`);
                    }
                    simpChannel.send(embed);
                })
                .catch((reason) => {
                    client.guilds.resolve(config['simp-server']).members.fetch(config['creator'])
                        .then((user) => {
                            return user.createDM();
                        })
                        .then((dmChannel) => {
                            dmChannel.send(`Error log: Failed to grab random user: ${reason}\nCache:\n${cache}`);
                            let embed = new discord.MessageEmbed()
                                .setDescription(`Today's task:\nSimp for <@!${targetServer.members.resolve(simpRecipients[Math.floor(Math.random() * simpRecipients.length)])}>`)
                                .setColor(genRandHex())
                                .setThumbnail("https://faebotwebsite.s3.amazonaws.com/files/20200904_125435.jpg")
                                .setTitle("Wake And Bake, It's Simp Time!");
                            simpChannel.send(embed);
                        })
                        .catch((dmFailReason) => {
                            console.log(`Failed to fetch random member: ${reason}\nFailed to create DM channel with creator: ${dmFailReason}`);
                        });
                });
        }
        if (hourCounter % 1 == 0) {
            hourCounter = 0;
            let leaderboard = generateLeaderboard();
            let embed = new discord.MessageEmbed()
                .setDescription(leaderboard)
                .setColor(genRandHex())
                .setThumbnail("https://i2.wp.com/pa1.narvii.com/6119/bd51869c9e3bb834571359421c78495c421e7b03_hq.gif")
                .setTitle("Leaderboard");
            dmCreator(embed);
        }
        if (hourCounter >= 23) {
            hourCounter = 0;
        }
    }, simpDelay);
});

client.on('message', (message) => {
    if (userMsgCount.has(message.author.id)) {
        userMsgCount.set(message.author.id, userMsgCount.get(message.author.id) + 1);
    } else {
        userMsgCount.set(message.author.id, 1);
    }
    if (message.content.toLowerCase().includes("simp") && message.content.toLowerCase().includes("?")) {
        let embed = new discord.MessageEmbed()
            .setDescription(`Hmm...you should simp for <@!${simpRecipients[Math.floor(Math.random() * simpRecipients.length)]}>`)
            .setColor(genRandHex())
            .setThumbnail("https://faebotwebsite.s3.amazonaws.com/files/20200904_125435.jpg")
            .setTitle("Simp On Demand");
        message.channel.send(embed);
    } else if (message.channel.id == config["simp-channel"]) {
        if (message.content.toLowerCase().includes("fight") && message.content.toLowerCase().includes("bot")) {
            let embed = new discord.MessageEmbed()
                .setDescription(fightLines[randInt(0, fightLines.length)])
                .setColor(genRandHex())
                .setThumbnail("https://media1.tenor.com/images/b13ba77a7a858ac42d40dc7d03d6f226/tenor.gif")
                .setTitle("You Wanna Fight?");
            message.channel.send(embed);
        }
    } else if (message.content.includes("give avatar")) {
        if (message.mentions.users.array().length == 0) {
            message.channel.send(message.author.avatarURL({ size: 4096 }));
        } else {
            message.channel.send(message.mentions.users.array()[0].avatarURL({ size: 4096 }));
        }
    } else if (message.content == "stop!") {
        message.channel.send("Sorry!");
        client.destroy();
    }
});

client.login(config["token"]);

// Utility function(s) ********
function genRandHex() {
    let result = "";
    let characters = "0123456789ABCDEF";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '0x' + result;
}

function randInt(min, max) {
    return Math.floor(Math.random() * max - min) + min;
}

function findMapMaxValue() {
    if (userMsgCount.size < 1) {
        return null;
    }
    if (userMsgCount.size == 1) {
        let userId = userMsgCount.values().next().value;
        return {
            id : userId,
            messages : userMsgCount.get(userId)
        }
    }
    let maxEntry = {
        id: 0,
        messages: -1
    }
    userMsgCount.forEach((value, key, map) => {
        if (value > maxEntry.messages) {
            maxEntry.id = key;
            maxEntry.messages == value;
        }
    });
    return (maxEntry.messages > 0) ? maxEntry : null;
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

function generateLeaderboard() {
    let max = {
        id: 0,
        messages: -1
    };
    let leaderboard = "Name - Messages sent\n";
    while (userMsgCount.size > 0 && max != null) {
        console.log(userMsgCount.size);
        max = findMapMaxValue();
        if (max != null && max.messages > 0){
            leaderboard += "`" + targetServer.members.resolve(max.id).nickname + "` - `" + max.messages + "`\n";
            userMsgCount.delete(max.id);
        }
        if (userMsgCount.size == 1) {
            leaderboard += "`" + targetServer.members.resolve(userMsgCount.values().next().value).nickname + "` - `" + userMsgCount.get(userMsgCount.values().next().value) + "`\n";
            break;
        }
    }
    return leaderboard;
}

// *********

process.on('unhandledRejection', (reason) => {
    console.clear();
    dmCreator(`Unhandle rejection: ${reason}`);
    client.destroy();
});

process.on('uncaughtException', (err) => {
    console.clear();
    dmCreator(`Unhandled Exception: ${err}`);
    client.destroy();
});