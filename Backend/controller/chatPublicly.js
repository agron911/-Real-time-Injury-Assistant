
import { loadMessages, storeMessage} from "../model/Message.js"
import { io } from "../utils/socketSetup.js";
export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export const receiveMessage = async(req, res)=>{
    const mess = await storeMessage(req.body.username, req.body.content, req.body.timestamp);
    io.emit('chat message', mess)
}

export const getMessages = async() => {
    return await loadMessages();
}


// export async function getMessages(){
//   const messages = await loadMessages()
//   return messages
// }
    

  



