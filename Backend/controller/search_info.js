import DAO from "../model/dao.js"

function containsStopWords(word){
    const words = word.split(" ");
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
    for(var i = 0; i< stopWords.length; i++) {
        if(!stopWords.includes(words[i])){
            return false;
        }
    }
    return true;
}

export const searchByPublicMessage = async(req,res)=>{
    const content = req.params.content;
    if(!containsStopWords(content)){
        const result = await DAO.getInstance().search_by_public_messages(content);
        res.status(200).send({search_result:result});
    }else{
        res.status(402).send();
    }
  
}

export const searchByPrivateMessages = async(req,res)=>{
    console.log(req.params)
    const content = req.params.content;
    const sender = req.params.sender;;
    const receiver = req.params.receiver;
    if(!containsStopWords(content)){
        const result = await DAO.getInstance().search_by_private_messages(content, sender, receiver);
        res.status(200).send({search_result:result});
    }else{
        res.status(402).send({search_result:[]});
    }
    
}

export const searchByUsername = async(req,res)=>{
    const result = await DAO.getInstance().search_by_username(req.params.user);
    console.log("usernamesearch");
    res.status(200).send({search_result:result});
}
export const searchByAnnouncement = async(req,res)=>{
    const content = req.params.content;
    if(!containsStopWords(content)){
        const result = await DAO.getInstance().search_by_announcement(req.params.content);
        res.status(200).send({search_result:result});
    }else{
        res.status(402).send();
    }
    const result = await DAO.getInstance().search_by_announcement(req.params.content);
    res.status(200).send({search_result:result});
}

export const searchByStatus = async(req, res)=>{
    const status = req.params.status;
    if(status == "status"){
        res.status(200).snd({status_history})
    }
    else{
        const result = await DAO.getInstance().search_by_status(status);
        res.status(200).send({search_result:result});
    }
    
}

