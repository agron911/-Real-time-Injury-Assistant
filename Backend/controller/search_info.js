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
    var content = req.query.content;
    const limit = req.query.limit;
    //console.log(req.query)
    content = filterStopWords(content);
    try{
        if(content.length ===0){
            res.status(200).send({search_result:[]});
        }
        else{
            const result = await DAO.getInstance().search_by_public_messages(content, limit);
            res.status(200).send({search_result:result});
        }
        
    }catch(err){
        res.status(400).send({message: "search_by_public_messages failure"});
    }
}

export const searchByPrivateMessages = async(req,res)=>{
    console.log(req.query)
    let content = req.query.content;
    const sender = req.query.sender;;
    const receiver = req.query.receiver;
    const limit = req.query.limit;
    
    if(content == "status"){
        const result = await DAO.getInstance().search_by_username(receiver)
        let status_hist = result[0].statusHistory;
        if(status_hist.length > 10){
            status_hist = status_hist.slice(-10);
        }
        status_hist = status_hist.reverse();
        let status_message = new MessageObj(sender, "Status History: " +status_hist, new Date().toString(), result[0].status, receiver )
        res.status(200).send({search_result:[status_message.obj]})
    }else{
        content = filterStopWords(content);
        try{
            if(content.length ===0){
                res.status(200).send({search_result:[]});
            }else{
                const result = await DAO.getInstance().search_by_private_messages(content, receiver, sender, limit);
                res.status(200).send({search_result:result});
            }
            
        }catch(err){
            res.status(400).send({message: "search_by_private_messages failure"});
        }
    }
}

export const searchByAnnouncement = async(req,res)=>{
    let content = req.query.content;
    let limit = req.query.limit
    console.log(req.query)
    content = filterStopWords(content);
    try{
        if(content.length ===0){
            res.status(200).send({search_result:[]});
        }
        else{
            const result = await DAO.getInstance().search_by_announcement(content, limit);
            res.status(200).send({search_result:result});
        }
        
    }catch(err){
        res.status(400).send({message: "search_by_announcement failure"});
    }
}

export const searchByUsername = async(req, res)=>{
    const result = await DAO.getInstance().search_by_username(req.query.user);
    res.status(200).send({search_result:result});
}


export const searchByStatus = async(req, res)=>{
    const status = req.query.status;
    const result = await DAO.getInstance().search_by_status(status);
    res.status(200).send({search_result:result});
}

