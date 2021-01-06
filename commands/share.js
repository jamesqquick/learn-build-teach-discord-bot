const { shareTable } = require('../utils/Airtable');
const { isValidUrl } = require('../utils/Helpers');
const ogs = require('open-graph-scraper');

const shareHandler = async (msg) => {
    const parts = msg.content.split(' ');
    if (parts.length !== 2) return;
    const link = parts[1];
    if (!isValidUrl(link)) {
        return msg.channel.send('Please include a valid url');
    }
    //TODO: check to see when the last time they created a record was?
    let ogResult;
    try {
        const data = await ogs({ url: link });
        ogResults = data.result;

        if (!ogResult.ogTitle || !ogResult.ogDescription || !ogResult.ogImage) {
            return msg.channel.send(
                `Sorry, this site doesn't appeat to have og data.`
            );
        }
    } catch (err) {
        console.error('Something went wrong while scraping data.');
        console.error(err);
        return msg.channel.send(
            `Sorry, there was an issue scraping open graph data. Please make sure this site has appropriate og information set in the head.`
        );
    }

    try {
        const { ogTitle, ogDescription, ogImage } = ogResult;
        console.log({ ogTitle, ogDescription, ogImage });

        await shareTable.create([
            {
                fields: {
                    discordUser: msg.author.username,
                    link,
                    title: ogTitle,
                    image: ogImage.url,
                    description: ogDescription,
                },
            },
        ]);
        await msg.react(`🔥`);
        await msg.reply(`Content successfully shared. Thanks!`);
    } catch (err) {
        console.error('Something went wrong in sharing to airtable.');
        console.error(err);
        await msg.reply(
            `Failed to save share record :(. @jamesqquick should take a look!`
        );
    }
};

module.exports = {
    callback: shareHandler,
};