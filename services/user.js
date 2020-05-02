class User {
  constructor(sender_ID){
    this.id = sender_ID;
    this.name = null;
    this.bday = null;
    this.participation = null;
    this.conversation = [];
  }

  addMessage(message){
    this.conversation.push(message);
  }

  getLastMessage(){
    return this.conversation[this.conversation.length - 1];
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