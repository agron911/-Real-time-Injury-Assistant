import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";

function filterStopWords(input) {
    const stopWords = [
      "a", "able", "about", "across", "after", "all", "almost", "also", "am", "among", "an", "and", "any", "are",
      "as", "at", "be", "because", "been", "but", "by", "can", "cannot", "could", "dear", "did", "do", "does",
      "either", "else", "ever", "every", "for", "from", "get", "got", "had", "has", "have", "he", "her", "hers",
      "him", "his", "how", "however", "i", "if", "in", "into", "is", "it", "its", "just", "least", "let", "like",
      "likely", "may", "me", "might", "most", "must", "my", "neither", "no", "nor", "not", "of", "off", "often",
      "on", "only", "or", "other", "our", "own", "rather", "said", "say", "says", "she", "should", "since", "so",
      "some", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this", "tis", "to", "too",
      "twas", "us", "wants", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
      "will", "with", "would", "yet", "you", "your"
    ];
  
    const words = input.trim().split(" ");
    const filteredWords = words.filter(word => !stopWords.includes(word.toLowerCase()));
  
    if (filteredWords.length == 0) {
      return "";
    }
  
    return filteredWords.join(" ");
}

export const searchByPublicMessage = async(req,res)=>{
    var content = req.params.content;
    const limit = req.params.limit;
    content = filterStopWords(content);
    const result = await DAO.getInstance().search_by_public_messages(content, limit);
    res.status(200).send({search_result:result});
    res.status(402).send();
}

export const searchByPrivateMessages = async(req,res)=>{
    //console.log(req.params)
    let content = req.params.content;
    const sender = req.params.sender;;
    const receiver = req.params.receiver;
    const limit = req.params.limit;
    if(content == "status"){
        const result = await DAO.getInstance().search_by_username(sender)
        let status_message = new MessageObj(sender, "Status History: " +result[0].statusHistory.join(','), Date.now(), result[0].status, receiver )
        console.log( result[0].statusHistory)
        res.status(200).send({search_result:[status_message.obj]})
    }else{
        content = filterStopWords(content);
        const result = await DAO.getInstance().search_by_private_messages(content, sender, receiver, limit);
     
        res.status(200).send({search_result:result});
    }
}

export const searchByAnnouncement = async(req,res)=>{
    let content = req.params.content;
    content = filterStopWords(content);
    const result = await DAO.getInstance().search_by_announcement(req.params.content, req.params.limit);
    res.status(200).send({search_result:result});
}

export const searchByUsername = async(req, res)=>{
    const result = await DAO.getInstance().search_by_username(req.params.user);
    res.status(200).send({search_result:result});
}


export const searchByStatus = async(req, res)=>{
    const status = req.params.status;
    const result = await DAO.getInstance().search_by_status(status);
    res.status(200).send({search_result:result});
}

