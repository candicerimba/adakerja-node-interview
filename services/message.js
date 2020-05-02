import request from 'request';

class Message {
    print(sender, message){
        // Check if the message contains text
        if (message && message.text) {    
          console.log(`${sender} sent the message: ${message.text}.`);
        }  
    }

    send(recipient, message) {
      // Construct the message body
      let request_body = {
        "recipient": {
          "id": recipient
        },
        "message": message
      }

      request({
        "uri": `https://graph.facebook.com/v6.0/me/messages?access_token=${process.env.ACCESS_TOKEN}`,
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('Message sent!' + JSON.stringify(request_body) + res.statusCode + JSON.stringify(res.body.error));
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    }

}

export default new Message();