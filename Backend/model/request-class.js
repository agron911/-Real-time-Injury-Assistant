import DAO from "./dao.js";

class Request {
    constructor(username, content, severity, assignedTo, status, id) {
        this.username = username;
        this.content = content;
        this.severity = severity;
        this.assignedTo = assignedTo;
        this.status = status;
        this.id = id;
    }

    async save(){
        const requestData = {
            username: this.username,
            content: this.content,
            severity: this.severity,
            assignedTo: this.assignedTo,
            status: this.status,
        }
        const request = await DAO.getInstance().createRequest(requestData);
        this.id = request.id;
        return request;
    }
    async updateStatus(requestId, status){
        const requestData = {
            username: this.username,
            content: this.content,
            severity: this.severity,
            assignedTo: this.assignedTo,
            status: status,
        }
        const request = await DAO.getInstance().updateRequest(requestId, requestData);
        this.id = request.id;
        return request;
    }

    getSchemaObject(){
        return {
            username: this.username,
            content: this.content,
            severity: this.severity,
            assignedTo: this.assignedTo,
            status: this.status,
            id: this.id, 
        }
    }
}

export default Request;