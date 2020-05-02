'use strict';

import webhookController from './controllers/webhook.controller';
import messageController from './controllers/message.controller';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Creates the endpoint for our webhook 
app.post('/webhook', webhookController.post.bind(webhookController));

  // Adds support for GET requests to our webhook
app.get('/webhook', webhookController.get.bind(webhookController));

// Messages routes
app.get('/messages', messageController.getAll.bind(messageController));
app.get('/messages/:id', messageController.getByID.bind(messageController));

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('Webhook listening on port 1337!'));
