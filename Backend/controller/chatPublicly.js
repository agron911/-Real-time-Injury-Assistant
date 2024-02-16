
import { loadMessages, storeMessage} from "../model/Message.js"
import io from '../../server.js'
export const ChatroomView = (req, res) => {
    res.render("chatroom");
};

export  const receiveMessage = async(req, res)=>{
    const mess= await storeMessage(req.body.username, req.body.content)
    io.emit('chat message', mess)
  
}



// export async function getMessages(){
//   const messages = await loadMessages()
//   return messages
// }
    

  



