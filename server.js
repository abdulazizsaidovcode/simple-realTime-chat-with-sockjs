const http = require('http');
const express = require('express');
const sockjs = require('sockjs');

const app = express();
const server = http.createServer(app);

const connections = new Set();  // Foydalanuvchilarni saqlash uchun Set yaratamiz

const sockServer = sockjs.createServer();
sockServer.on('connection', (conn) => {
    connections.add(conn);  // Yangi ulanishni qo'shamiz

    conn.on('data', (message) => {
        // Barcha ulangan foydalanuvchilarga xabar yuborish
        connections.forEach((client) => {
            if (client !== conn && client.readyState === sockjs.OPEN) {
                client.write(message);
            }
        });
    });

    conn.on('close', () => {
        connections.delete(conn);  // Ulanish yopilganda o'chirib tashlaymiz
        console.log('Connection closed');
    });
});

sockServer.installHandlers(server, {prefix:'/chat'});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
