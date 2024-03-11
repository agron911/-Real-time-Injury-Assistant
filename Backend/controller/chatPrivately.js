import DAO from "../model/dao.js"


export const loadPrivateMessages = async(req, res) => {
    const messages = await DAO.getAllPrivateMessages(req.body.username, req.body.receiver);
    res.send({archive:messages})
}