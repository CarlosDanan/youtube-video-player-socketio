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
//Connect socket
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    //Download event from client
    socket.on('download', async (videoId, count) => {
        //If this is not the first video. Eliminate previous stored video. 
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
        //Validate youtube ID
        const youtubeId = videoId;
        const validated = ytdl.validateID(youtubeId);
        //If valid get video info and stream
        if (validated) {
            console.log('the youtube Id:' + youtubeId + 'is a ' + validated + ' youtube Id');
            let info = await ytdl.getInfo(youtubeId);
            socket.emit('info-ready', info.videoDetails.title, info.videoDetails.lengthSeconds)
            ytdl.downloadFromInfo(info, { quality: 'lowest' }).pipe(fs.createWriteStream('./' + count + '.mp4')).on("finish", () => {
                //When video downloaded emit 'video-ready' event to client
                socket.emit('video-ready', true)
            });
        }
    })
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');

    });
});
//Stream video in '/get_video/:count' URL 
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