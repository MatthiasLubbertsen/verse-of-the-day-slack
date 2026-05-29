const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

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
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welkom op je nieuwe Home tab!* :tada:"
            }
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