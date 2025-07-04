import DAO from "../model/dao.js"
import MessageObj from "../model/message-class.js";



export const searchByPublicMessage = async (req, res) => {
    var content = req.query.content;
    const limit = req.query.limit;
    try {
        if (content.length === 0) {
            res.status(200).send({ search_result: [] });
        }
        else {
            const result = await DAO.getInstance().search_by_public_messages(content, limit);
            res.status(200).send({ search_result: result });
        }

    } catch (err) {
        res.status(400).send({ message: "search_by_public_messages failure" });
    }
}

export const searchByPrivateMessages = async (req, res) => {
    
    let content = req.query.content;
    const sender = req.query.sender;;
    const receiver = req.query.receiver;
    const limit = req.query.limit;

    if (content == "status") {
        const result = await DAO.getInstance().search_by_username(sender)
        let status_hist = result[0].statusHistory;
        if (status_hist.length > 10) {
            status_hist = status_hist.slice(-10);
        }
        status_hist = status_hist.reverse();
        let status_message = new MessageObj(sender, "Status History of last 10 status changes for " + "sender: " + status_hist, new Date().toString(), result[0].status, receiver)
        res.status(200).send({ search_result: [status_message.obj] })
    } else {
        try {
            if (content.length === 0) {
                res.status(200).send({ search_result: [] });
            } else {
                const result = await DAO.getInstance().search_by_private_messages(content, receiver, sender, limit);
                res.status(200).send({ search_result: result });
            }

        } catch (err) {
            res.status(400).send({ message: "search_by_private_messages failure" });
        }
    }
}

export const searchByAnnouncement = async (req, res) => {
    let content = req.query.content;
    let limit = req.query.limit
    
    try {
        if (content.length === 0) {
            res.status(200).send({ search_result: [] });
        }
        else {
            const result = await DAO.getInstance().search_by_announcement(content, limit);
            res.status(200).send({ search_result: result });
        }

    } catch (err) {
        res.status(400).send({ message: "search_by_announcement failure" });
    }
}

export const searchByUsername = async (req, res) => {
    const result = await DAO.getInstance().search_by_username(req.query.user);
    res.status(200).send({ search_result: result });
}


export const searchByStatus = async (req, res) => {
    
    const status = req.query.status;
    if (!status) {
        return res.status(400).send({ message: "Status parameter is required." });
    }
    try {
        const result = await DAO.getInstance().search_by_status(status);
        res.status(200).send({ search_result: result });
    } catch (err) {
        console.error("Error searching by status:", err);
        res.status(500).send({ message: "Failed to search by status" });
    }
}

