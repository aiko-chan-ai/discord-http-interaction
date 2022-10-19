# discord-http-interaction

> ## Install
```
$ npm i discord-http-interaction@latest
```

## Usage

<img src='https://cdn.discordapp.com/attachments/878276279105884210/1032280415488184330/unknown.png'>

```js
// client is Discord.js Client
// express is Express Server || undefined || null

const { Client } = require('discord.js');

/* Option
const express = require('express');
const app = express();
*/

const client = new Client({
    // Your Client Options
});

const Interaction = require('discord-http-interaction');

function callback(data) {
    return client.actions.InteractionCreate.handle(data);
}

Interaction(app, {
    port: process.env.PORT || 3000,
    publicKey: process.env.PUBLIC_KEY,
}, callback);

client.on("interactionCreate", async interaction => {
    // Your Code
});

client.login(process.env.TOKEN);
```