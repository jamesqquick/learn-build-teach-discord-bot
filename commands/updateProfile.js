const { userTable, getDiscordUserById } = require('../utils/Airtable');
const { isValidUrl } = require('../utils/Helpers');

const validFlags = {
    '-twitter': {
        validate: (str) => !isValidUrl(str),
        validationMessage:
            'Please make sure you enter just your handle (no @) for Twitter',
    },
    '-website': {
        validate: (str) => isValidUrl(str),
        validationMessage:
            'Please make sure you enter a valid URL for your website.',
    },
    '-youtube': {
        validate: (str) => isValidUrl(str),
        validationMessage:
            'Please make sure you enter the full URL to your YouTube channel.',
    },
    '-twitch': {
        validate: (str) => !isValidUrl(str),
        validationMessage:
            'Please make sure you enter just your username for Twitch.',
    },
    '-instagram': {
        validate: (str) => !isValidUrl(str),
        validationMessage:
            'Please make sure you enter just your username for Instagram.',
    },
    '-github': {
        validate: (str) => !isValidUrl(str),
        validationMessage:
            'Please make sure you enter just your username for Github.',
    },
};

const updateProfile = async (msg) => {
    if (msg.author.bot) return;

    const parts = msg.content.split(' ');

    const hasEvenArgs = (parts.length - 1) % 2 === 0;
    if (!hasEvenArgs) {
        return await msg.reply(
            `Please make sure you have passed the appropriate amount of arguments`
        );
    }
    const args = parts.filter((p) => !p.startsWith("-"));


    const discordUsername = msg.author.username;
    const discordId = msg.author.id;
    const userUpdates = {
        discordUsername,
        discordId,
    };

    for (let i = 1; i < parts.length; i += 2) {
        const flagName = parts[i];

        if (!validFlags[flagName]) {
            return await msg.reply(
                `Please make sure you have passed appropriate flags : [${flags}]`
            );
        }
        const value = args[Number(i / 2).toFixed(0)];
        if (!validFlags[flagName].validate(value)) {
            return await msg.reply(
                `Please make sure you have passed an appropriate value for the ${flagName} flag. ${validFlags[flagName].validationMessage}`
            );
        }

        userUpdates[flagName.substring(1)] = value;
    }
    console.log('User updates', userUpdates);

    try {
        const existingUser = await getDiscordUserById(discordId);
        if (existingUser) {
            //user already exists so update
            const userId = existingUser.id;
            await userTable.update(userId, userUpdates);
            console.log('User successfully updated', userUpdates);
        } else {
            //user does not exist, so create
            const newUser = {
                fields: {
                    ...userUpdates,
                },
            };
            userTable.create([newUser]);
            console.log('User successfully created', newUser);
        }

        await msg.react(`🔥`);
        await msg.reply(`Profile updated succcessful. Thanks!`);
    } catch (err) {
        console.error('Something went wrong while trying to update profile.');
        console.error(err);
        return msg.channel.send(
            `Sorry, something went wrong. We failed to update your profile.`
        );
    }
};

module.exports = {
    text: '!updateProfile',
    callback: updateProfile,
};
