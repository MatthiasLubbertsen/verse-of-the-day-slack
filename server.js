require('dotenv').config();
const { App } = require('@slack/bolt');
const Database = require('better-sqlite3');
const path = require('path');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const db = new Database(path.join(__dirname, 'verse.db'));

db.pragma('journal_mode = WAL');
db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
        slack_user_id TEXT PRIMARY KEY,
        translation TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

const getTranslationStatement = db.prepare(
    'SELECT translation FROM user_settings WHERE slack_user_id = ?'
);

const upsertTranslationStatement = db.prepare(`
    INSERT INTO user_settings (slack_user_id, translation, updated_at)
    VALUES (@slackUserId, @translation, CURRENT_TIMESTAMP)
    ON CONFLICT(slack_user_id) DO UPDATE SET
        translation = excluded.translation,
        updated_at = CURRENT_TIMESTAMP
`);

function getSavedTranslation(slackUserId) {
    const row = getTranslationStatement.get(slackUserId);
    return row ? row.translation : '';
}

function saveTranslation(slackUserId, translation) {
    upsertTranslationStatement.run({ slackUserId, translation });
}

function buildHomeView(translation = '', message = '') {
    const blocks = [];

    if (message) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message
            }
        });

        blocks.push({ type: 'divider' });
    }

    blocks.push(
        {
            type: 'header',
            text: {
                type: 'plain_text',
                text: ':book: Verse Of The Day',
                emoji: true
            },
            level: 1
        },
        {
            type: 'divider'
        },
        {
            type: 'input',
            block_id: 'translation_input',
            element: {
                type: 'plain_text_input',
                action_id: 'plain_text_input-action',
                initial_value: translation
            },
            label: {
                type: 'plain_text',
                text: '<https://bible.com|Bible.com> translation to use'
            },
            optional: false
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: 'Find your translation at <bible.com|https://bible.com> in the url!'
                }
            ]
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Submit!',
                        emoji: true
                    },
                    value: 'submit-verse',
                    action_id: 'actionId-0'
                }
            ]
        }
    );

    return {
        type: 'home',
        blocks
    };
}

// Luister naar het event dat we net hebben ingesteld
app.event('app_home_opened', async ({ event, client, logger }) => {
    try {
        const translation = getSavedTranslation(event.user);

        await client.views.publish({
            user_id: event.user,
            view: buildHomeView(translation)
        });
    } catch (error) {
        logger.error(error);
    }
});

app.action('actionId-0', async ({ body, ack, client }) => {
    await ack();
    const translation = body.view.state.values.translation_input['plain_text_input-action'].value;
    saveTranslation(body.user.id, translation);

    await client.views.publish({
        user_id: body.user.id,
        view: buildHomeView(translation, `*Saved translation:* ${translation}`)
    });
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app staat aan!');
})();