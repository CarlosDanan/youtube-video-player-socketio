const express = require('express');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
app.use(cors());
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:5173"
    }
});

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    socket.on('download', async (videoId, count) => {
        if (count > 0) {
            if (fs.existsSync('./' + (count - 1) + '.mp4')) {
                fs.unlink('./' + (count - 1) + '.mp4', (err) => {
                    if (err) {
                        throw err
                    }
                    console.log("deleted")
                })
            }
        }
        const youtubeId = videoId;
        const validated = ytdl.validateID(youtubeId);
        if (validated) {
            console.log('the youtube Id:' + youtubeId + 'is a ' + validated + ' youtube Id');
            let info = await ytdl.getInfo(youtubeId);
            socket.emit('info-ready', info.videoDetails.title, info.videoDetails.lengthSeconds)
            ytdl.downloadFromInfo(info, { quality: 'lowest' }).pipe(fs.createWriteStream('./' + count + '.mp4')).on("finish", () => {
                socket.emit('video-ready', true)
            });
        }
    })
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');

    });
});
/*
app.get("/get-video-info/:id", async function (req, res) {
    const youtubeId = req.params.id;
    const validated = ytdl.validateID(youtubeId);
    if (validated) {
        console.log('the youtube Id:' + youtubeId + 'is a ' + validated + ' youtube Id');
        let info = await ytdl.getInfo(youtubeId);
        ytdl.downloadFromInfo(info, { quality: 'lowest' }).pipe(fs.createWriteStream('video.mp4'))
    }
});
*/
app.get('/get_video/:count', (req, res) => {
    const path = req.params.count + `.mp4`;
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

http.listen(4000, () => {
    console.log('Listening on port 4000!')
});