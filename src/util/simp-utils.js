function stringifyMembers(guild) {
    return new Promise((resolve, reject) => {
        let memberString = "";
        guild.members.fetch({
            force: true
        })
        .then((members) => {
            members = members.array();
            members.forEach((member) => {
                memberString += `${member.nickname}; `;
            });
            resolve(memberString);
        })
        .catch((err) => {
            reject(err);
        });
    });
}

exports.stringifyMembers = stringifyMembers;