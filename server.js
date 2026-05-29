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
            // https://app.slack.com/block-kit-builder/E09V59WQY1E/builder#%7B%22blocks%22:%5B%7B%22type%22:%22header%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22:book:%20Verse%20Of%20The%20Day%22,%22emoji%22:true%7D,%22level%22:1%7D,%7B%22type%22:%22divider%22%7D,%7B%22type%22:%22input%22,%22block_id%22:%22translation_input%22,%22element%22:%7B%22type%22:%22plain_text_input%22,%22action_id%22:%22plain_text_input-action%22%7D,%22label%22:%7B%22type%22:%22plain_text%22,%22text%22:%22%3Chttps://bible.com%7CBible.com%3E%20translation%20to%20use%22%7D,%22optional%22:false%7D,%7B%22type%22:%22context%22,%22elements%22:%5B%7B%22type%22:%22mrkdwn%22,%22text%22:%22Find%20your%20translation%20at%20%3Cbible.com%7Chttps://bible.com%3E%20in%20the%20url!%22%7D%5D%7D,%7B%22type%22:%22actions%22,%22elements%22:%5B%7B%22type%22:%22button%22,%22text%22:%7B%22type%22:%22plain_text%22,%22text%22:%22Submit!%22,%22emoji%22:true%7D,%22value%22:%22submit-verse%22,%22action_id%22:%22actionId-0%22%7D%5D%7D%5D%7D
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
                        "block_id": "translation_input",
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

app.action('actionId-0', async ({ body, ack, client }) => {
    await ack();
    const translation = body.view.state.values.translation_input['plain_text_input-action'].value;
    await client.views.publish({
        user_id: body.user.id,
        view: {
            type: 'home',
            blocks: [
                {
                    type: 'divider'
                },
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
                        action_id: 'plain_text_input-action'
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
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        "text": `*Current configured translation:* ${translation}`
                    }
                }
            ]
        }
    });
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app staat aan!');
})();