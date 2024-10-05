import dotenv from 'dotenv'
dotenv.config();
import * as fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import axios from 'axios'

const filename  = process.env.EVENTS_FILE_NAME || 'events.jsonl'
const baseUri = process.env.BASE_URI || 'http://localhost:8000'
const headerAuth = process.env.API_PUBLIC_KEY || 'secret'

const EVENTS = {
   ADD: 'add_revenue',
   SUBSTRACT: 'subtract_revenue'
}
const events = async () => {
   let events =  readFile(filename).trim().split('\n')
                  .map(event => JSON.parse(event))
                  .filter(event => event.name === EVENTS.ADD || event.name === EVENTS.SUBSTRACT);

     try {
      await Promise.all(events.map( async event => {
         await axios.post(`${baseUri}/liveEvent`,{
            ...event
         },{
            headers:{
               authorization: headerAuth
            }
         })
      
    }));
      
     }catch(error) {
      console.error(`One event was failed - ${error.message} `)
      throw new Error(error.message);
     }           
  
  
  
}

const readFile = (filename) => {
   try {
      const filePath = join(__dirname,filename);
       return fs.statSync(filePath).size > 0 ? fs.readFileSync(filePath, 'utf-8') : null
   } catch(error) {
      console.error(`Error in readFile ${filename}:`, error.message);
     return null;
   }  
}

await events()