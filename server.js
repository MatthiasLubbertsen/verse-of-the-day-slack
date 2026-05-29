require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Luister naar het event dat we net hebben ingesteld
app.event('app_home_opened', async ({ event, client, logger }) => {
    try {
        // Publiceer de Home tab
        await client.views.publish({
            user_id: event.user,
            view: {
                type: 'home',
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": ":book: Verse Of The Day",
                            "emoji": true
                        },
                        "level": 1
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "plain_text_input-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "<https://bible.com|Bible.com> translation to use"
                        },
                        "optional": false
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "Find your translation at <bible.com|https://bible.com> in the url!"
                            }
                        ]
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Submit!",
                                    "emoji": true
                                },
                                "value": "submit-verse",
                                "action_id": "actionId-0"
                            }
                        ]
                    }
                ]
            }
        });
    } catch (error) {
        logger.error(error);
    }
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app staat aan!');
})();