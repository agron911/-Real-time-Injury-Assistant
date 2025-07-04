import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"
import OpenAI from "openai";
import { configDotenv } from 'dotenv';
configDotenv();

let openai = new OpenAI({ apiKey: process.env.CHAT_GPT_API_KEY});

export const firstaidView = (req, res) => {
    const data = { 
        title: "SA1 Seek First Aid", 
    };
    res.status(200).render("firstaid", {data});
}

export const loadInjuryByUsernames = async(req, res) => {
    try{
        const injuries = await DAO.getInstance().getInjuryByUser(req.params.username);
        res.status(200).send({ injury: injuries });
    }catch(err){
        // console.log(err);
        res.status(400).send({message: "database failure"})
    }
}

export const receiveInjury = async(req, res)=>{
    try{
        await DAO.getInstance().updateInjury(req.params.username, req.body.timestamp, req.body.parts, req.body.bleeding, req.body.numbness, req.body.conscious);
        res.status(200).send({message: "injury received"})
    }catch(err){
        // console.log(err);
        res.status(400).send({message: "database failure"})
    }
}


export const createChatMsg = async(req, res) => {
    try{
        const injuries = await DAO.getInstance().getInjuryByUser(req.params.username);
        let message = "Please provide first aid instructions to the user with the following injuries: " + injuries.parts;
        if (injuries.bleeding){
            message += " and is bleeding";
        }
        if (injuries.numbness){
            message += " and is feeling numb";
        }
        if (injuries.conscious){
            message += " and has lost consciousness";
        }
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: message }],
            model: "gpt-3.5-turbo",
        });
        // 
        res.status(200).send({message: completion.choices[0].message.content});
    }catch(err){
        res.status(400).send({message: "openai failure"})
    }
}


