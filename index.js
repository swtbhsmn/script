const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        const videosDir = "video";
        const files = fs.readdirSync(videosDir);
        const videos = files;
        const html = `
      <html>
        <head>
          <title>Video List</title>
        </head>
        <body>
          <h1>Video List</h1>
          <ul>
            ${videos.map(video => `<li><a href="#" onclick="playVideo('${video}')">${video}</a></li>`).join('')}
          </ul>
          <video id="video-player" controls muted>
            <source src="" type="video/mp4">
          </video>
          <script>
            function playVideo(videoName) {
              const videoPlayer = document.getElementById('video-player');
              const videoUrl = '/${videosDir}/' + encodeURIComponent(videoName);
              videoPlayer.src = videoUrl;
              //videoPlayer.play();
            }
          </script>
        </body>
      </html>
    `;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } else if (req.url.startsWith('/video')) {
        const filePath = __dirname + req.url;
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
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
            fs.createReadStream(filePath).pipe(res);
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
