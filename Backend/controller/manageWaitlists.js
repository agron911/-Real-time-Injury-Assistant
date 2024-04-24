import { io } from "../utils/socketSetup.js";
import DAO from "../model/dao.js"

export const waitlistElectView = (req, res) => {
    const data = { 
        title: "SA1 Manage Medicine Waitlists", 
    };
    res.render("waitlist", {data});
}

export const waitlistCitizenView = (req, res) => {
    const data = { 
        title: "SA1 Manage Medicine Waitlists", 
    };
    res.render("waitlistCitizen", {data});
}

export const waitlistProviderView = (req, res) => {
    const data = { 
        title: "SA1 Manage Medicine Waitlists", 
    };
    res.render("waitlistProvider", {data});
}

export const getWaitlistRole = async (req, res) => {
    const username = req.params.username;
    const user = await DAO.getInstance().getUserByName(username);
    res.status(200).send({role: user.waitlistRole});
}

export const setWaitlistRole = async (req, res) => {
    const username = req.body.username;
    const role = req.body.role;
    await DAO.getInstance().updateWaitlistRole(username, role);
    res.status(200).send({role: role});
}

export const getWaitlist = async (req, res) => {
    try {
        const username = req.params.username;
        const waitlist = await DAO.getInstance().getWaitlist();
        const positions = [];
        waitlist.forEach(item => {
            if (item.citizens.some(citizen => citizen.username == username)) {
                const position = item.citizens.findIndex(citizen => citizen.username == username);
                positions.push({ name: item.name, position: position });
            }
        });
    res.status(200).send({waitlists: waitlist, positions: positions});
    } catch (error) {
        res.status(400).send({message: "Error getting waitlist"});
    }
    
}

export const getWaitlistDetails = async (req, res) => {
    const name = req.params.medname;
    const waitlist = await DAO.getInstance().getWaitlistByName(name);
    let info = [];
    await Promise.all(waitlist.citizens.map(async (item) => {
        const injury = await DAO.getInstance().getInjuryByUser(item.username);
        info.push({ username: item.username, time: item.timestamp, injury: injury });
    }));
    res.status(200).send({ member: info });
}

export const joinWaitlist = async (req, res) => {
    const username = req.body.username;
    const name = req.body.medname;
    const timestamp = req.body.timestamp;
    await DAO.getInstance().addCitizenToWaitlist(name, username, timestamp);
    io.emit('waitlist-join', {medname: name});
    res.status(200).send({message: "Joined waitlist"});
}

export const leaveWaitlist = async (req, res) => {
    const name = req.params.medname;
    const username = req.params.username;
    await DAO.getInstance().removeCitizenFromWaitlist(name, username);
    io.emit('waitlist-leave', {medname: name});
    res.status(200).send({message: "Left waitlist"});
}

export const newWaitlist = async (req, res) => {
    const medname = req.body.medname;
    const description = req.body.description;
    await DAO.getInstance().createWaitlist(medname, description);
    res.status(200).send({message: "Waitlist created"});
}

export const handleSupplyWaitlist = async (req, res) => {
    io.emit('waitlist-provider-supply', {medname: req.body.medname, num: req.body.num});
    const num = req.body.num;
    const supplier = req.body.supplier;
    const waitlist = await DAO.getInstance().getWaitlistByName(req.body.medname);
    if (waitlist.citizens.length <= num) {
        waitlist.citizens.map(async (citizen) => {
            await DAO.getInstance().createNotification(citizen.username, supplier, req.body.medname, new Date().toString());
        });
        await DAO.getInstance().emptyCitizensByName(req.body.medname);
        io.to(req.body.medname).emit('waitlist-supply', {medname: req.body.medname, supplier: supplier});
        if (waitlist.citizens.length < num) {
            const extra = num - waitlist.citizens.length;
            await DAO.getInstance().updateCountByName(req.body.medname, waitlist.count + extra);
            await DAO.getInstance().addSupplierToWaitlist(req.body.medname, supplier, extra);
            io.emit('waitlist-overflow-supply', {medname: req.body.medname, extra: extra});
        }
    } else if (waitlist.citizens.length > num) {
        for (let i = 0; i < num; i++) {
            const citizen = waitlist.citizens[i];
            await DAO.getInstance().createNotification(citizen.username, supplier, req.body.medname, new Date().toString());
            await DAO.getInstance().removeCitizenFromWaitlist(req.body.medname, citizen.username);
            io.to(req.body.medname).emit('waitlist-limit-supply', {medname: req.body.medname, target: citizen.username, supplier: supplier});
        }
    }
    res.status(200).send({message: "Supply handled"});
}

export const handleGetStockSupply = async (req, res) => {
    const medname = req.body.medname;
    const waitlist = await DAO.getInstance().getWaitlistByName(medname);
    if (waitlist.count <= 0) {
        
        res.status(400).send({message: "Error! No stock available"});
        return;
    }
    await DAO.getInstance().updateCountByName(medname, waitlist.count - 1);
    if (waitlist.supplier.length <= 0) {
        
        res.status(400).send({message: "Error! No supplier available"});
        return;
    }
    const supplier = waitlist.supplier[0];
    const newcount  = supplier.count - 1;
    await DAO.getInstance().removeSupplierFromWaitlist(medname, supplier.username);
    if (newcount > 0) {
        await DAO.getInstance().addSupplierToWaitlist(medname, supplier.username, newcount);
    } 
    io.emit("waitlist-join-stock", {medname: medname});
    res.status(200).send({supplier: supplier.username});
}

export const getNotificationByUsername = async (req, res) => {
    const username = req.params.username;
    const notifications = await DAO.getInstance().getNotificationByUser(username);
    res.status(200).send({notifications: notifications});
}

export const createNotification = async (req, res) => {
    try {
        const username = req.body.username;
        const supplier = req.body.supplier;
        const medname = req.body.medname;
        const timestamp = req.body.timestamp;
        // console.log(username, supplier, medname, timestamp);
        await DAO.getInstance().createNotification(username, supplier, medname, timestamp);
        res.status(200).send({message: "Notification created"});
    } catch (error) {
        res.status(400).send({message: "Error creating notification"});
    }
    
}

export const deleteNotification = async (req, res) => {
    try {
        const id = req.params.id;
        await DAO.getInstance().deleteNotificationById(id);
        res.status(200).send({message: "Notification updated"});
    } catch (error) {
        res.status(400).send({message: "Error deleting notification"});
    }
    
}
