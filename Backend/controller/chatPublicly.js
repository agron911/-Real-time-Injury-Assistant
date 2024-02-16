
import { loadMessages, storeMessage} from "../model/Message.js"
export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export async function receiveMessage(data, io){
  const mess= await storeMessage(data.username, data.content)
  io.emit('chat message', mess)
}

// export async function getMessages(){
//   const messages = await loadMessages()
//   return messages
// }
    

  



