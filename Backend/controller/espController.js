import Citizen from "../model/user-Citizen.js";

export const EmergencyServicesView = (req, res) => {
    const data = { 
        title: "Emergency Services", 
    };
    res.render("emergencyServices",{data});
};

export const registerAsEsp = async (req, res) => {
    const username = req.params.username;
    const esp = req.body.esp;
    try{
        let citizen = await Citizen.retrieveUserByUsername(username);
        citizen = await citizen.modifyEsp(esp);
        res.status(200).send(citizen.toSchemaObject());
    } catch(err){
        
        res.status(404).send("User not found");
    }    
}