## Set up
1. Create a new google sheet and create a new sheet with name `id_to_name`
1. Open Apps Script
  * In google sheets, click `extensions` -> `Apps Script`
1. Copy and paste the template found in this repo's `src folder into the code editor
1. Replace the template spreadsheet id `<your spreadsheet id>` with your spreadsheet id
  * Your Spreadsheet id can be found in the URL for your spreadsheet. For example, in the URL `https://docs.google.com/spreadsheets/d/abcdefgh/edit#gid=0`, the spreadsheet ID is `abcdefgh`.
1. Create a new telegram bot by messaging @BotFather on telegram.
1. Set the privacy of the telegram bot to `Disabled`
  * Go to BotFather and enter `/setprivacy`
  * Select your bot
  * Enter `Disable`
  * Follow the instructions from telegram's webpage [here](https://core.telegram.org/bots/features#creating-a-new-bot)
1. Replace the template bot token `<your telegram bot token>` with your telegram bot token.
1. Deploy your bot and set it as public
  * `Deploy` -> `New Deployment`
  * `Select type` -> `Web app`
  * `Who has access` -> 'Anyone`
  * `Deploy`
1. When prompted to authorise access, proceed to do so.
1. Copy the new web app url and replace the template web app url `<your web app url>`.
1. Select the `resetWebhook` function from the drop down menu in the editor's tool bar and click `run` to set up webhook with telegram
  * This links telegram with your web app so that your web app receives updates when your bot is messaged.
  * ** It is important to repeat the previous 2 steps to replace the webhook url and run the reset webhook function everytime you make changes to your code and redeply your app**
