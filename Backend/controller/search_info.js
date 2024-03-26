import DAO from "../model/dao.js"

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

export const searchByPublicMessage = async(req, res)=>{
    const content = filterStopWords(req.params.content);
    if (content == "") {
        res.status(201).send({search_result:[]});
    } else {
        const result = await DAO.getInstance().search_by_public_messages(content);

        res.status(200).send({search_result:result});
    }
}

export const searchByPrivateMessages = async(req, res)=>{
    const content = filterStopWords(req.params.content);
    const sender = req.params.sender;;
    const receiver = req.params.receiver;
    if (content == "") {
        res.status(201).send({search_result:[]});
    } else {
        const result = await DAO.getInstance().search_by_private_messages(content, sender, receiver);
        res.status(200).send({search_result:result});

    }
    
    
}

export const searchByAnnouncement = async(req,res)=>{
    const content = filterStopWords(req.params.content);
    if (content == ""){
        res.status(201).send({search_result:[]});
    } else {
        console.log(content);
        const result = await DAO.getInstance().search_by_announcement(content);
        console.log(result);

        res.status(200).send({search_result:result});
    }
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

