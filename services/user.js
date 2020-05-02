class User {
  constructor(sender_ID){
    this.id = sender_ID;
    this.name = null;
    this.bday = null;
    this.participation = null;
    this.conversation = [];
    this.lastBotQuestionType = null;
  }

  addMessage(message){
    this.conversation.push(message);
  }

  getLastBotMessageType(){
    return this.lastBotQuestionType;
  }

  updateLastBotMessageType(val){
    this.lastBotQuestionType = val;
  }

  getConversationLength(){
    return this.conversation.length;
  }

  updateName(name){
    this.name = name;
  }

  updateBday(date){
    this.bday = date;
  }

  updateParticipation(bool){
    this.participation = bool;
  }
}

export default User;