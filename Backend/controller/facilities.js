import { fileURLToPath } from 'url';
import { dirname } from 'path';
export const Facilities =(req, res)=>{
    let data = {
        title:"Medical Facilities"
    }
    
    res.render('facilities', {data})
}