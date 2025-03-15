import axios from 'axios';
import Logger from './logger.js';

const CDN_BASE = "https://cdn.discordapp.com";
const REVIEWDB_BASE = "https://manti.vendicated.dev/api/reviewdb";

async function fetchAPI(route, base) {
    try {
        const response = await axios.get(`${base}/${route}`, {
            headers: {
                Authorization: `Bot ${process.env.BOT_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        Logger.log(`Error fetching API: ${error.message}`);
        throw error;
    }
}

async function getReviews(id) {
    let firstFetch = [];
    let all = [];
    let offset = 0;
    const limit = 50;
    
    try {
        while (true) {
            const reviewData = await fetchAPI(`users/${id}/reviews?limit=${limit}&offset=${offset}`, REVIEWDB_BASE);
            if (!reviewData.reviews || reviewData.reviews.length === 0) break;

            if (offset === 0) {
                firstFetch = reviewData;
            }
            
            all.push(...reviewData.reviews);
            if (reviewData.reviews.length < limit) break;
            
            offset += limit;
        }

        all.shift();
        all.sort((a, b) => b.timestamp - a.timestamp);

        all.forEach(review => {
            if (review.sender && review.sender.profilePhoto) {
                review.sender.profilePhoto = review.sender.profilePhoto.replace(
                    /https:\/\/cdn\.discordapp\.com\/avatars\/(\d+\/(?:a_)?[a-f0-9]+)\.(png|gif)/,
                    "$1.$2"
                ).replace(/https:\/\/cdn\.discordapp\.com\/embed\/avatars\//, "1234567890/");
            }
        });

        return { ...firstFetch, reviews: all };
    } catch (error) {
        Logger.error(`Error fetching reviews: ${error.message}`);
        throw error;
    }
}

async function getCDN(type, id) {
    try {
        const imageData = await axios.get(`${CDN_BASE}/${type}/${id}`, {
            responseType: 'arraybuffer'
        });
        return {
            data: imageData.data,
            type: imageData.headers['content-type']
        };
    } catch (error) {
        Logger.error(`Error fetching image: ${error.message}`);
        try {
            const imageData = await axios.get(`${CDN_BASE}/embed/avatars/${parseInt(id) % 5}.png`, {
                responseType: 'arraybuffer'
            });
            return {
                data: imageData.data,
                type: imageData.headers['content-type']
            };
        } catch (error) {
            Logger.error(`Error fetching default image: ${error.message}`);
        }
        throw error;
    }
}

export { fetchAPI, getReviews, getCDN };