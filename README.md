# Finonex-Serivce-Bar

Finonex Serivce Bar microservices

## Get Started

Get started developing...

```shell
# install deps
npm install

#run 


## Summary

There are three  files that enable you to customize and develop:
1. ./client.js` - This file simulates   client-side sending event to the server .
2. ./server.js` - This server-side processing and storing client's data.
3. ./data_processor.js` - This file  processing and storing  server's data in Postgres DB.

## Install Dependencies

Install all package dependencies (one time operation)

```shell
npm install
```
Execute the `db.sql` script within your preferred database management tool to initialize the `users_revenue` table schema.


## Run It
Runs the application's server side 

```shell
node  ./server.js
```
Runs the application's client side 

```shell
node  ./client.js
```
Proccesing data to DB. 

```shell
node  ./data_processor.js
```



   
