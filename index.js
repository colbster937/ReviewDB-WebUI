import express from 'express';
import dotenv from 'dotenv';
import { fetchAPI, getReviews, getCDN } from './src/fetch.js';
import Logger from './src/logger.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const API_BASE = "https://discord.com/api/v10";

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.static('public'));

app.get('/api/server/:invite', async(req, res) => {
    try {
        const { invite } = req.params;
        const serverData = await fetchAPI(`invites/${invite}`, API_BASE);
        const reviewData = await getReviews(serverData.guild.id);
        res.send({
            ...reviewData,
            server: {
                ...serverData.guild,
            }
        });
    } catch (error) {
        Logger.error(`Error fetching data: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/cdn/:type/:id/:hash', async(req, res) => {
    try {
        const { type, id, hash } = req.params;
        const img = await getCDN(type, `${id}/${hash}`);
        res.setHeader('Content-Type', img.type);
        res.send(img.data);
    } catch (error) {
        Logger.error(`Error fetching data: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    Logger.log(`Server is running on port ${PORT}`);
});