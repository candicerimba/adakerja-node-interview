class Message {
    print(sender, message){
        // Check if the message contains text
        if (message.text) {    
          console.log(`${sender} sent the message: ${received_message.text}.`);
        }  
    }
}

export default new Message();