import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import * as fs from 'fs';
import postgres from 'pg'



const pool = new postgres.Pool({
    user:  process.env.DB_USER  ||  'admin',
    host: process.env.DB_HOST   || 'localhost',
    database: process.env.DB_NAME || 'finonex',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
})

const app = express();
const port = process.env.PORT || 8000;
const filePath = process.env.FILE_PATH || './users_transaction.json';
const headerAuth = process.env.API_PUBLIC_KEY || 'secret'

app.use(express.json());

app.use((err,req,res,next)  => {
    res.status(err.response ? err.response.status : 500).json({error: err.message});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 

const handleErrorAsync = func => async (req,res,next) => {
    try {
        await func(req,res,next)
    } catch(error) {
        next(error)
    }
}
const customAuthentication = (header) => (req, res, next) => {
    if (req.headers['authorization'] !== header) {
      return res.status(401).send('Unauthorized!');
    }
    next();
  };

app.post('/liveEvent',customAuthentication(headerAuth), (req, res) => {   
    appendToFile(req.body)
    res.send({message: 'event  added to file'});
});
app.get('/userEvents/:userid',customAuthentication(headerAuth),handleErrorAsync( async (req, res) => {
        const {userid} = req.params;
       const response =  await retriveFromDB(userid)
        res.status(200)
        .send(response);
}))  


const appendToFile = (data) => {
    if(fs.existsSync(filePath)) {
       fs.appendFileSync(filePath, JSON.stringify(data) + '\n');
       return;
    }
    fs.writeFileSync(filePath,JSON.stringify(data) + '\n');
}

const retriveFromDB = async (userId) => {
        const db = await pool.connect();
        const response = await db.query('SELECT * FROM users_revenue WHERE user_id = $1 ', [userId]);
        db.release();
        return response.rows.length > 0 ? response.rows[0] : {userId , message: 'No Data'}
}




