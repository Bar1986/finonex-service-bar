import dotenv from 'dotenv'
dotenv.config();

import * as fs from 'fs';
import postgres from 'pg';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filename = process.env.REVENUE_BATCH_FILE_NAME || 'users_transaction.json'
const pool = new postgres.Pool({
    user:  process.env.DB_USER  ||  'admin',
    host: process.env.DB_HOST   || 'localhost',
    database: process.env.DB_NAME || 'finonex',
    password: process.env.DB_PASSWORD || '123456',
    port: process.env.DB_PORT || 5432,
});

const revenueBatch = async () => {
    const filePath = join(__dirname,filename);
   if(fs.existsSync(filePath)) {
    const file = fs.createReadStream(filePath)
    const data = readline.createInterface({
        input: file,
        crlfDelay: Infinity
    });
      const mapedData =  await mapData(data)
       await processData(mapedData);
       return;
   }
   console.info(`${filename} Not Exist`)
   
}

const mapData = async(data) => {
    const revenues = new Map();
    for await (const events of data) {
        const {userId,name,value} = JSON.parse(events);
        const balance = name === 'add_revenue' ?  value : - value
        if(revenues.has(userId)) {
            revenues.set(userId,revenues.get(userId) + balance);
        }else {
            revenues.set(userId,balance);
        }
    }
    return revenues;
}

const processData = async (mapedData) => {
    try {
       const db = await pool.connect();
        for(const [userId,balance] of mapedData) {
            console.log(`Updating balance ${balance} of ${userId}`)
            await db.query(`INSERT INTO users_revenue(user_id,revenue) VALUES($1,$2) ON CONFLICT (user_id) DO UPDATE SET revenue=users_revenue.revenue  + EXCLUDED.revenue`
                ,[userId , balance]);
        }
        db.release();

    }catch(error) {
        console.error(`Failed to process data to DB ${error.message}`);
        throw new Error(error.message)
    }
}
await revenueBatch();