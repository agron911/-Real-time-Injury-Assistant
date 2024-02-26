import mongoose from "mongoose";

export class DAO {
    static main_uri = "mongodb+srv://daniilturpitka:Letoosen228@cluster0.1fayqt0.mongodb.net/?retryWrites=true&w=majority";
    static #configured = false; // private
    static _db; // this must implement all IDatabase operations

    static get db() {
    if (DAO.#configured) return DAO._db;
        throw new Error("DB not configured!");
    }

    static set db(uri) {
    if (DAO.#configured) throw new Error("DB already configured!");
        return (async () =>{
            try {
                await mongoose.connect(uri);
                DAO.#configured = true;
                console.log("Database connected\n");
            }
                catch (error) {
                    console.log("Unable to connect to Database\n");
                    throw new Error("Unable to connect to Database\n");
                }
        })();
        
    }
}



