const discord = require('discord.js');
const config = require('./config.json');
const simpUtils = require('./src/util/simp-utils');

const client = new discord.Client();
var simpChannel, targetServer;

client.on('ready', () => {
    targetServer = client.guilds.resolve(config["simp-server"]);
    simpChannel = targetServer.channels.resolve(config["simp-channel"])
    console.log("Up and running!");
});

client.on('message', (message) => {
    if (!message.channel.id == simpChannel.id) {
        return;
    }
    if (message.content.toLowerCase().includes("ping")) {
        message.channel.send("Pong!")
    }
    if (message.content.includes("simp") && message.content.includes("?")) {
        message.channel.send("I'm taking a break for now! Sorry. You can go bully Kate for taking me down if you want to.");
    }
    if (message.content.includes(config["prefix"])) {
        if (!(message.channel.id == config["simp-channel"] || message.channel.type == "dm")) {
            return;
        }
        if (message.content.includes("get_members")) {
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

// Utility functions

function genRandHex() {
    let result = "";
    let characters = "0123456789ABCDEF";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '0x' + result;
}