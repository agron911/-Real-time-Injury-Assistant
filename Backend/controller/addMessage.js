import {storeMessage} from '../model/Message.js'
import {io} from '../../server'
import {v4 as uuidv4} from 'uuid'
import storeMessage from '../model/Message'

export const newMessage = async (req, res)=>{
  const message = {
    username: req.body.username,
    content: req.body.messageContent,
    timestamp: getDate(),
    messageId: uuidv4()
  }
  try{
    const mess= await storeMessage(message.username, message.content, message.messageId)
    io.emit('/newmessage', mess)
  }catch(error){
    console.log(error)
    res.status(500).send('something went wrong while storing message')
  }
  res.status(200).send('Message successfuly received')
}



