import Request from "../model/request-class.js";
import DAO from "../model/dao.js";
import { io } from "../utils/socketSetup.js";
import { getEspSocketIds, getSocketIds } from "../model/ActiveUser.js";

export const createRequest = async (req, res) => {
    const content = req.body.content;
    const severity = req.body.severity;
    const username = req.body.username;
    try{        
        const request = new Request(username, content, severity, null, "UNRESOLVED");
        await request.save();    
        res.status(200).send(request.getSchemaObject());
        const socketIds = await getEspSocketIds();
        if(socketIds&&socketIds.length>0){socketIds.forEach(socketId => {
            io.to(socketId).emit('notify-esp', request.id);            
        });}
        io.emit('update-request-wall');
    } catch(e){
        res.status(404).send('Unable to create request');
    }
}

const getRequestsByUsername = async (res, username) =>{
    try{
        const requestsObjs = await DAO.getInstance().getRequestsByUsername(username);
        const requests = requestsObjs.map(request => {
            const reqObj = new Request(request.username, request.content, request.severity, request.assignedTo, request.status, request.id);
            return reqObj.getSchemaObject();
        })
        res.status(200).send(requests);
    } catch (e) {
        res.status(404).send(e.message);
    }
}

const getRequestsByStatus = async (res, statuses) =>{
    try{
        const requestsObjs = await DAO.getInstance().getRequestsByStatus(statuses);
        const requests = requestsObjs.map(request => {
            const reqObj = new Request(request.username, request.content, request.severity, request.assignedTo, request.status, request.id);
            return reqObj.getSchemaObject();
        })
        res.status(200).send(requests);
    } catch (e) {
        res.status(404).send(e.message);
    }
}


export const getRequests = async (req, res) => {
    const statuses = req.query.status;
    const username = req.query.username;
    if(statuses){
        getRequestsByStatus(res, statuses);
    } else if (username){
        getRequestsByUsername(res, username);
    }        
}

export const getRequest = async (req, res) => {
    try {
        const requestData = await DAO.getInstance().getRequestById(req.params.id);
        const request = new Request(requestData.username, requestData.content, requestData.severity, requestData.assignedTo, requestData.status, requestData.id);
        res.status(200).send(request.getSchemaObject())         
    } catch (e){
        res.status(404).send(e.message); 
    }
}

export const updateRequest = async (req, res) => {
    const id = req.params.id;
    const newRequest = req.body;
    try {
        const originalRequest = await DAO.getInstance().getRequestById(id);
        const updatedRequest = await DAO.getInstance().updateRequest(id, newRequest);
        const request = new Request(updatedRequest.username, updatedRequest.content, updatedRequest.severity, updatedRequest.assignedTo, updatedRequest.status, updatedRequest.id);
        io.emit('update-request-wall');

        if(originalRequest.status=="UNRESOLVED"&&updatedRequest.status=="ONGOING"){
            const socketIds = await getSocketIds(originalRequest.username);
            socketIds.forEach(socketId => {
                io.to(socketId).emit('notify-citizen', request.id);            
            });
        }
        res.status(201).send(request.getSchemaObject());
        

    } catch (e){
        res.status(404).send(e.message); 
    }
}

export const deleteRequest = async (req, res) => {
    const id = req.params.id;
    try {
        await DAO.getInstance().removeRequest(id);
        res.status(201).send("Deleted");
        io.emit('update-request-wall');
    } catch (e){
        res.status(404).send(e.message)
    }
}
