import User from '../services/user';
import Message from '../services/message';
import MESSAGE_TYPE from '../constants/message_type';
import moment from 'moment';

class HistoryController {
  constructor(){
    // {sender_id: its User instance}
    this.users = {};
  }

  process (sender, message) { 
    let user = this.users[sender];
    if (!user){
      user = new User(sender);
      this.users[sender] = user
    }

    let response = "";

    // Trying to record data
    // If there's never been a conversation, no response to parse. 
    if (user.getConversationLength() > 0){
      if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_NAME){
        user.updateName(message.message.text);
      } else if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_BIRTHDAY){
        const reply = message.message.text;
        
        // Manual date validity check
        if (reply.length === 10) {
          let splitted = reply.split("-");
          if (splitted && (splitted.length === 3 || splitted[0].length === 4 || splitted[1].length === 2 || splitted[2].length === 2)) {
          
            var numbers = /^[0-9]+$/;
            if(splitted.every((e) => e.match(numbers))){
              const listOfDays = [31,28,31,30,31,30,31,31,30,31,30,31];
              splitted = splitted.map((e)=>parseInt(e));
              if (splitted[0] <= new Date().getFullYear() && splitted[1]<=12 && splitted[2] <= listOfDays[splitted[1]]){
                user.updateBday(message.message.text);
              }
            }
          }
        }
      } else if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_PARTICIPATION){
        const yesReplies = ['yes', 'ye', 'y', 'sure', 'yeah', 'yep', 'yup', 'yah'];
        const noReplies = ['no', 'nah', 'n', 'nope', 'no thanks', 'nup', 'non'];
        
        const cleaned = message.message.text.toLowerCase().trim();
        if (yesReplies.includes(cleaned)){
          user.updateParticipation(true);
        } else if (noReplies.includes(cleaned)){
          user.updateParticipation(false);
        }
      }
    }

    // Sending a response
    // Ask for name is the user's name hasn't been set.
    if (user.name === null){
      // If this is user's first name
      if (user.getConversationLength() <= 0){
        response = {
          type: MESSAGE_TYPE.ASKING_NAME,
          message: "Hi there! Thanks for talking to me! My name is Wimb! I'll tell you how far your birthday is from today! But first, what is your name?"
        };
      } 
      // Unlikely to reach here, but if bot wants to ask for their name again.
      else if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_NAME){
        response = {
          type: MESSAGE_TYPE.ASKING_NAME,
          message: "Sorry, I didn't catch that. What is your name?"
        };
      }

    // Ask for the user's birthday if not yet set
    } else if (user.bday === null){
      // If first time asking for their birthday
      if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_NAME){
        response = {
          type: MESSAGE_TYPE.ASKING_BIRTHDAY,
          message: "Nice to meet you! So, when's your birthday? Please enter in the format of YYYY-MM-DD."
        };
      } else if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_BIRTHDAY){
        response = {
          type: MESSAGE_TYPE.ASKING_BIRTHDAY,
          message: "I don't think that looks right. Please ensure that the date you have written is correct and is in the format of YYYY-MM-DD."
        };  
      }

    // Ask if the user wants to participate if not yet set.
    } else if (user.participation === null){
      // If first time asking for their participation
      if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_BIRTHDAY){
        response = {
          type: MESSAGE_TYPE.ASKING_PARTICIPATION,
          message: "Thanks for telling me that! Would you like to know how far your birthday is?"
        };

      // If there was an error in recognizing input.
      } else if (user.getLastMessage().type === MESSAGE_TYPE.ASKING_PARTICIPATION){
        response = {
          type: MESSAGE_TYPE.ASKING_PARTICIPATION,
          message: "Sorry, I didn't catch that. Did you want to know how far your birthday is?"
        };  
      }
    } else if (user.participation === true) {
      const currTime = new Date();
      const bday = moment(user.bday,'YYYY-MM-DD').toDate();
      let nextYear = currTime.getFullYear();
      console.log(currTime.getMonth())
      if (currTime.getMonth() > bday.getMonth() || (currTime.getMonth() === bday.getMonth() && currTime.getDate >= bday.getDate())){
        console.log('womp');
        nextYear += 1;
      }
      console.log(nextYear);
      const nextBday = new Date(nextYear + user.bday.slice(4,10));
      const days = Math.ceil((nextBday.getTime() - currTime.getTime()) / (1000 * 3600 * 24));

      // Send them the number of days left. 
      if (days === 0){
        response = {
          type: MESSAGE_TYPE.SENDING_BIRTHDAY,
          message: `Today is your birthday! Happy Birthday! 🎉🎂`, 
        }; 
      }
    } else {
      response = {
        type: MESSAGE_TYPE.SENDING_BIRTHDAY,
        message: "Goodbye! 👋", 
      };  
    }
    
    user.addMessage({type: MESSAGE_TYPE.USER_SENT, message: message}); 
    
    Message.send(sender, {text: response.message})
    user.addMessage(response);

  }
}

export default new HistoryController();