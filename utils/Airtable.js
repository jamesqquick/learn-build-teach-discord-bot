const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
);

const shareTable = base(process.env.AIRTABLE_SHARE_TABLE_NAME);
const userTable = base(process.env.AIRTABLE_USER_TABLE_NAME);

const minifyRecord = (record) => {
    if (!record.fields.completed) record.fields.completed = false;
    return {
        id: record.id,
        fields: record.fields,
    };
};

const getDiscordUserById = async (id) => {
    const records = minifyRecords(
        await userTable
            .select({
                maxRecords: 1,
                filterByFormula: `{discordId} = "${id}"`,
            })
            .firstPage()
    );

    if (records.length !== 1) {
        return null;
    }
    return records[0];
};

const getShareRecordToTweet = async () => {
    const records = minifyRecords(
        await shareTable
            .select({
                maxRecords: 1,
                filterByFormula: `AND({tweetable} = "1", {tweeted} != "1")`,
            })
            .firstPage()
    );
    if (records.length !== 1) return null;
    return records[0];
};

const minifyRecords = (records) =>
    records.map((record) => minifyRecord(record));

const deleteUserRecord = async (discordId) => {
    return userTable.destroy([discordId]);
};

module.exports = {
    shareTable,
    minifyRecord,
    minifyRecords,
    userTable,
    getDiscordUserById,
    getShareRecordToTweet,
    deleteUserRecord,
};
