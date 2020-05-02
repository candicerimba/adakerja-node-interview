import HistoryController from './history.controller';

class MessageController {
    getAll(req, res){
        try {
            const messages = HistoryController.getAllMessages();
            const filtered = messages.filter((e)=> e.sender);
            res.status(200).send(filtered);
        } catch (e) {
            console.log(e);
            res.status(404).send(e);
        }
    }

    getByID(req, res){
        const { id } = req.params;

        try {
            const message = HistoryController.getMessageById(id);
            res.status(200).send(message);
        } catch (e) {
            console.log(e);
            res.status(404).send(e);
        }
    }
}

export default new MessageController();