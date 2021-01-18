function stringifyMembers(guild) {
    return new Promise((resolve, reject) => {
        let memberString = "";
        guild.members.fetch()
        .then((members) => {
            members = members.array();
            members.forEach((member) => {
                if (member.user.username != null) {
                    memberString += `${member.user.username}\n`;
                }
            });
            resolve(memberString);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function getRandomUser(guild, excludeBots=false) {
    return new Promise((resolve, reject) => {
        guild.members.fetch()
        .then((members) => {
            if (excludeBots) {
                members = members.array().filter((member) => !member.bot);
            } else {
                members = members.array();
            }
            resolve(members[randInt(0, members.length)]);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

function randInt(min, max) {
    return Math.floor(Math.random() * max - min) + min;
}

exports.stringifyMembers = stringifyMembers;
exports.getRandomUser = getRandomUser;
exports.randInt = randInt;