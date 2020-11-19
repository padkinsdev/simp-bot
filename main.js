const discord = require('discord.js');
const config = require('./config.json');
const cron = require('node-cron');

const client = new discord.Client();
const simpRecipients = [
    "621357020808740924",
    "293841274639745025",
    "215249462665281536",
    "359196366171537410",
    "359196366171537410",
    "618320455287177241",
    "204035386689716225"
]

client.on('ready', () => {
    console.log("I'm alive!");
});

client.on('message', (message) => {
    if (message.content.toLowerCase() == "who should i simp for?") {
        let embed = new discord.MessageEmbed()
        .setDescription(`Hmm...you should simp for <@!${simpRecipients[Math.floor(Math.random() * simpRecipients.length)]}>`)
        .setColor(genRandHex())
        .setThumbnail(message.author.avatarURL())
        .setTitle("Simp On Demand");
        message.channel.send(embed);
    }
});

cron.schedule("* * 1 * * *", () => {
    let embed = new discord.MessageEmbed()
    .setDescription(`Today's task:\nSimp for <@!${simpRecipients[Math.floor(Math.random() * simpRecipients.length)]}>`)
    .setColor(genRandHex())
    .setThumbnail(client.user.avatarURL())
    .setTitle("Wake And Bake, It's Simp Time!");
    client.guilds.resolve(config["simp-server"]).channels.resolve(config["simp-channel"]).send(embed);
})

client.login(config["token"]);

// Utility function(s)
function genRandHex() {
    let result = "";
    let characters = "0123456789ABCDEF";
    for (var i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '0x' + result;
}
