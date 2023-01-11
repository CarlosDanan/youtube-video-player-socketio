const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();

app.get("/get-video-info/:id", async function (req, res) {
    const youtubeId = req.params.id;
    const validated = ytdl.validateID(youtubeId);
    if (validated) {
        console.log('the youtube Id:' + youtubeId + 'is a ' + validated + ' youtube Id');
        let info = await ytdl.getInfo(youtubeId);
        ytdl.downloadFromInfo(info, { quality: 'lowest' }).pipe(fs.createWriteStream('video.mp4'))
    }
});

app.get('/get_video', (req, res) => {
    const path = `video.mp4`;
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(path, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
});

app.use(cors());

app.listen(4000, () => {
    console.log('Listening on port 4000!')
});