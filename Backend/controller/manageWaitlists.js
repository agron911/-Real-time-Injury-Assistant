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
    const username = req.params.username;
    const role = req.params.role;
    await DAO.getInstance().updateWaitlistRole(username, role);
    res.status(200).send({role: role});
}

export const getWaitlist = async (req, res) => {
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
}

export const joinWaitlist = async (req, res) => {
    const username = req.params.username;
    const name = req.params.medname;
    await DAO.getInstance().addCitizenToWaitlist(name, username, new Date().toString());
    res.status(200).send({message: "Joined waitlist"});
}

export const leaveWaitlist = async (req, res) => {
    const username = req.params.username;
    const name = req.params.medname;
    await DAO.getInstance().removeCitizenFromWaitlist(name, username);
    res.status(200).send({message: "Left waitlist"});
}

