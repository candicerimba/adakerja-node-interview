import mockdate from 'mockdate';

import HistoryController from '../controllers/history.controller';
import User from '../services/user';
import MESSAGE_TYPE from '../constants/message_type';
import PAYLOAD_TYPE from '../constants/paylod_type';
import Message from '../services/message';

describe('Testing history controller', ()=>{
    describe('Testing without existing data', () => {
        it('Should initialise correctly', ()=> {
            expect(HistoryController.users).toEqual({});
            expect(HistoryController.messages).toEqual([]);
        });

        it('Should create new user and new message if no data about them', ()=>{
            HistoryController.process("User1", {
                text: "Hello!"
            });
            expect(Object.keys(HistoryController.users).length).toBe(1);

            const createdUser = HistoryController.users['User1'];

            expect(createdUser).toHaveProperty('name');
            expect(createdUser).toHaveProperty('bday');
            expect(createdUser).toHaveProperty('id');
            expect(createdUser).toHaveProperty('lastBotQuestionType');
            expect(createdUser).toHaveProperty('name');
            expect(createdUser).toHaveProperty('participation');
            expect(createdUser).toHaveProperty('conversation');

            expect(createdUser.id).toEqual('User1');
            
            // First message from user, second message from bot
            expect(createdUser.conversation).toEqual([0, 1])

            expect(HistoryController.messages.length).toEqual(2);
            
            const recvMessage = HistoryController.messages[0];
            expect(recvMessage.sender).toEqual(createdUser);
            expect(recvMessage.message).toEqual({
                 message: {
                     text: "Hello!",
                 },
                 type: MESSAGE_TYPE.USER_SENT,
            })
        });
    });
    describe('Testing with existing example data', ()=> {
        let sendSpy;
        beforeEach(()=>{
            sendSpy = jest.spyOn(Message, 'send'); 
            HistoryController.users = {
                'User2': new User(),
                'User3': new User(),
                'User4': new User(),
            };
            HistoryController.users['User2'].lastBotQuestionType = MESSAGE_TYPE.ASKING_NAME;
            HistoryController.users['User2'].conversation = [0, 1]

            HistoryController.users['User3'].lastBotQuestionType = MESSAGE_TYPE.ASKING_BIRTHDAY;
            HistoryController.users['User3'].name = "User3";
            HistoryController.users['User3'].conversation = [0, 1, 2, 3]

            HistoryController.users['User4'].lastBotQuestionType = MESSAGE_TYPE.ASKING_PARTICIPATION;
            HistoryController.users['User4'].name = "User4";
            HistoryController.users['User4'].bday = "2000-01-08";
            HistoryController.users['User4'].conversation = [0, 1, 2, 3, 4, 5]
        });

        afterEach(() => {    
            jest.clearAllMocks();
        });
        
        it('Should ask a brand new user its name.',()=>{
            const userId = "User1";
            HistoryController.process(userId, {
                text: "Hello!"
            });

            const latestReply = HistoryController.messages.slice(-1)[0];
            expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_NAME);
            
            const currUser = HistoryController.users[userId];
            expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_NAME);
            
            // Should send to the correct person
            expect(sendSpy).toHaveBeenCalled();
            expect(sendSpy.mock.calls[0][0]).toEqual(userId);

        });

        it('Should not ask the user their birthday if message sent was not text',()=>{
            const userId = "User2";
            HistoryController.process(userId, {
            });

            const latestReply = HistoryController.messages.slice(-1)[0];
            expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_NAME);
            
            const currUser = HistoryController.users[userId];
            expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_NAME);
            
            // Should send to the correct person
            expect(sendSpy).toHaveBeenCalled();
            expect(sendSpy.mock.calls[0][0]).toEqual(userId);

        });

        it('Should set the user\'s name and ask their birthday correctly',()=>{
            HistoryController.process("User2", {
                text: "User2"
            });

            const latestReply = HistoryController.messages.slice(-1)[0];
            expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_BIRTHDAY);
            
            const currUser = HistoryController.users['User2'];
            expect(currUser.name).toEqual("User2");
            expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_BIRTHDAY);
            
            // Should send to the correct person
            expect(sendSpy).toHaveBeenCalled();
            expect(sendSpy.mock.calls[0][0]).toEqual('User2');
        });

        it('Should keep asking for birthday if format is wrong or date is invalid',()=>{
            const replies = ["20", "abcd", "1234567890", "aaaa-bb-cc", "1111-22-33", "2000-13-25", "2000-2-30"];
            const userId = "User3";

            replies.forEach((date)=>{
                HistoryController.process(userId, {
                    text: date
                });

                const latestReply = HistoryController.messages.slice(-1)[0];
                expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_BIRTHDAY);
                
                const currUser = HistoryController.users[userId];
                expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_BIRTHDAY);
                
                // Should send to the correct person
                expect(sendSpy).toHaveBeenCalled();
                expect(sendSpy.mock.calls[0][0]).toEqual(userId);

            });
        });

        it('Should set the user\'s birthday and ask their participation correctly',()=>{
            HistoryController.process("User3", {
                text: "2000-08-01"
            });

            const latestReply = HistoryController.messages.slice(-1)[0];
            expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_PARTICIPATION);
            
            const currUser = HistoryController.users['User3'];
            expect(currUser.bday).toEqual("2000-08-01");
            expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_PARTICIPATION);
            
            // Should send to the correct person
            expect(sendSpy).toHaveBeenCalled();
            expect(sendSpy.mock.calls[0][0]).toEqual('User3');
        });

        it('Should keep asking for participation if unrecognized',()=>{
            const replies = ["yooo", "maybe", "fruits", "moot"];
            const userId = "User4";

            replies.forEach((date)=>{
                HistoryController.process(userId, {
                    text: date
                });

                const latestReply = HistoryController.messages.slice(-1)[0];
                expect(latestReply.message.type).toEqual(MESSAGE_TYPE.ASKING_PARTICIPATION);
                
                const currUser = HistoryController.users[userId];
                expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.ASKING_PARTICIPATION);
                
                // Should send to the correct person
                expect(sendSpy).toHaveBeenCalled();
                expect(sendSpy.mock.calls[0][0]).toEqual(userId);

            });
        });

        it('Should recognize quick replies for participation',()=>{
            const userId = "User4";

            Object.keys(PAYLOAD_TYPE).forEach((payload)=>{
                HistoryController.process(userId, {
                    quick_reply: {
                        payload: payload
                    }
                });

                const latestReply = HistoryController.messages.slice(-1)[0];
                expect(latestReply.message.type).toEqual(MESSAGE_TYPE.SENDING_BIRTHDAY);
                
                const currUser = HistoryController.users[userId];
                expect(currUser.participation).toEqual(Boolean(parseInt(payload)));
                expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.SENDING_BIRTHDAY);
                
                // Should send to the correct person
                expect(sendSpy).toHaveBeenCalled();
                expect(sendSpy.mock.calls[0][0]).toEqual(userId);

            });
        });

        it('Should recognize text replies for participation and send them the correct date',()=>{
            const userId = "User4";
            
            mockdate.set(1588494082103);
            HistoryController.process(userId, {
                text: "yes",
            });

            const latestReply = HistoryController.messages.slice(-1)[0];
            expect(latestReply.message.type).toEqual(MESSAGE_TYPE.SENDING_BIRTHDAY);

            expect(latestReply.message.message.text).toContain("250");

            const currUser = HistoryController.users[userId];
            expect(currUser.participation).toEqual(true);
            expect(currUser.lastBotQuestionType).toEqual(MESSAGE_TYPE.SENDING_BIRTHDAY);
            
            // Should send to the correct person
            expect(sendSpy).toHaveBeenCalled();
            expect(sendSpy.mock.calls[0][0]).toEqual(userId);

        });
    });
});