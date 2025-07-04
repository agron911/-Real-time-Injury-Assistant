import { fileURLToPath } from 'url';
import { dirname } from 'path';
import DAO from "../model/dao.js"
export const Facilities = async (req, res)=>{
    let data = {
        title:"Medical Facilities",
    }
    res.render('facilities', {data})
}

export const addFacility = async (req, res)=>{
    try{
        const facilityname = req.body.name;
        const facilitylongitude = req.body.longitude;
        const facilitylatitude = req.body.latitude;
        const facilitytype = req.body.type;
        const facilityaddress = req.body.address;
        const facilityHours = req.body.hours
        let result = await DAO.getInstance().addFacility(facilityname,facilitylatitude, facilitylongitude, facilitytype, facilityaddress, facilityHours);

        if(result){
            res.status(200).send({added: "Facility Added"});
        } 
        else{
            res.status(401).send({added: "Facility was not Added. Cannot add facilities outside of Santa Clara County, CA"});
        }
    }catch(err){
        
        res.status(400).send(err);
    }
}
export const getAllFacilities = async(req, res)=>{
    try{
        const facilities = await DAO.getInstance().getFacilities();
        res.status(200).send(facilities);
    }catch(err){
        res.status(400).send(err);
    }
}
export const getFacilityByName = async(req, res)=>{
    try{
        
        const facilities = await DAO.getInstance().getFacility(req.params.facilityname);
        res.status(200).send(facilities);
    }catch(err){
        res.status(400).send(err);
    }
}

export const searchFacility = async(req, res)=>{
    try{
        
        const facilities = await DAO.getInstance().searchFacility(req.query.description, req.query.mobility);
        res.status(200).send({searchresult:facilities});
    }catch(err){
        res.status(400).send(err);
    }

}

export const Test = async(req, res)=>{
    
    res.status(200).send({resp:"hi"})
}

export const deleteFacility = async(req, res)=>{
    try{
        await DAO.getInstance().deleteFacility(req.query.fname);
        res.status(200).send();
    }catch(err){
        res.status(400).send(err);
    }
}

export const updateFacilityInfo = async(req, res)=>{
    try{
        
        await DAO.getInstance().updateFacilityInfo(req.body.name, req.body.hours);
        res.status(200).send();
    }catch(err){
        res.status(400).send(err);
    }
}