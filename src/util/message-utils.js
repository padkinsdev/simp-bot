const config = require('../../config.json');

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