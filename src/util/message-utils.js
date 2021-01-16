const config = require('../../config.json');
const main = require('../../main');

var targetServer = null;
var simpChannel = null;

function init() {
    targetServer = main.client.guilds.resolve(config["simp-server"]);
    simpChannel = targetServer.channels.resolve(config["simp-channel"]);
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

function simpChannelSend(content) {
    simpChannel.send(content)
    .catch((sendFailReason) => {
        main.logger.error(`Failed to send ${content}: ${sendFailReason}`);
    });
}

exports.targetServer = targetServer;
exports.simpChannel = simpChannel;

exports.init = init;
exports.dmCreator = dmCreator;
exports.simpChannelSend = simpChannelSend;