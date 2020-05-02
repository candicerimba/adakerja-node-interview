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
        "uri": "https://graph.facebook.com/v6.0/me/messages?access_token=EAACZAgl7yvV0BALG1DdmGyVlCJ8j45Qy1ZCVudRc9Wwh21HBtZACOMbW34GCxUGwEuAFYZC6aR2BoJMgmNiaGLG898lKgOP6ZCDUWyfw0xjZCLsk4KUuLB8gBsHffojZCV8cDZCkS3IG8SZBbegbT4Ol1qBMXjXqxHBVoSjSPCZBdOnwZDZD",
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          console.log('Message sent!' + message.text + res.statusCode);
        } else {
          console.error("Unable to send message:" + err);
        }
      }); 
    }

}

export default new Message();