/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Mohammad Reazaul Karim Student ID: 178417234 Date: 14th May 2025
*
*  Published URL on Vercel:  
*
********************************************************************************/


require('dotenv').config();

const express = require('express');
const path = require("path");
const app = express();
const cors = require('cors');
const SitesDB = require("./modules/sitesDB.js");
const db = new SitesDB();
//console.log(db);

//const dataService = require('./data-service.js');
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors()); // Allow all origins
app.use(express.json()); // To enable jost parser


// Initialize Database



app.get('/', (req, res) => {
    res.json({"message": "API Listening", "term": "Summer 2025", "student": "178417234"})
});


app.post('/api/sites', async (req, res) => {
    try {
        await db.ensureInitialized(process.env.MONGODB_CONN_STRING);
        const newSite = await db.addNewSite(req.body);
        res.status(201).json(newSite);
    } catch (err) {
        res.status(500).json({ message: "Error adding site", error: err.message });
    }
});


app.get('/api/sites', async (req, res) => {
    try {
       // await db.ensureInitialized(process.env.MONGODB_CONN_STRING);        
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const filters = {};
        if (req.query.name) filters.name = req.query.name;
        if (req.query.region) filters.region = req.query.region;
        if (req.query.provinceOrTerritoryName) filters.provinceOrTerritoryName = req.query.provinceOrTerritoryName;
        //name, region, provinceOrTerritoryName    
        const sites = await db.getAllSites(page, perPage, filters.name,filters.provinceOrTerritoryName);
        res.status(200).json(sites);
        
    } catch (err) {
        res.status(500).json({ message: "Error retrieving sites", error: err.message });
    }
});


app.get('/api/sites/:id', async (req, res) => { 
    
    try {
        //await db.ensureInitialized(process.env.MONGODB_CONN_STRING);
        const site = await db.getSiteById(req.params.id);
        
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.status(200).json(site);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving site', error: err.message });
    }
});


app.put('/api/sites/:id', async (req, res) => {
    try {
        await db.ensureInitialized(process.env.MONGODB_CONN_STRING);
        const updatedSite = await db.updateSiteById(req.body,req.params.id);

        if (!updatedSite) {
            return res.status(404).json({ message: 'Site not found' });
        }

        res.status(200).json({ message: 'Site updated', site: updatedSite });

    } catch (err) {
        res.status(500).json({ message: 'Error updating site', error: err.message });
    }
});

app.delete('/api/sites/:id', async (req, res) => {
    try {
         //await db.ensureInitialized(process.env.MONGODB_CONN_STRING);
        const success = await db.deleteSiteById(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.status(204).send(); // No Content
    } catch (err) {
        res.status(500).json({ message: 'Error deleting site', error: err.message });
    }
});



// Resource not found (this should be at the end)
app.use((req, res) => {
  res.status(404).send("Resource not found");
});



db.initialize(process.env.MONGODB_CONN_STRING).then(()=>{
    app.listen(HTTP_PORT, ()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});
 

//module.exports = app;

// Below code is for call with our versel
//app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });