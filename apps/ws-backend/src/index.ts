import "dotenv/config";
import { WebSocket, WebSocketServer } from "ws";
// import { JWT_SECRET } from "./config";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import { prisma } from "@repo/db";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function CheckUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded == "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    }

    catch (e) {
        return null;
    }


}





wss.on('connection', function connection(ws, request) {

    const url = request.url;
    if (!url) {
        return
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') ?? "";
    const userId = CheckUser(token);
    if (!userId) {
        ws.close();
        return;
    }

    users.push({
        ws,
        rooms: [],
        userId
    })



    ws.on('message', async function message(data) {
        let parsedData : any ;
        if( typeof data !== "string"){
            parsedData = JSON.parse(data.toString());
        }
        else{
            parsedData = JSON.parse(data);
        }

        if (parsedData.type == "join_room") {
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return;
            }
            user.rooms.push(String(parsedData.roomId))
        }

        if (parsedData.type === "leave_room") {
            const roomId = String(parsedData.roomId);
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x !== roomId)

        }

        if (parsedData.type == "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;

            if (!roomId || isNaN(Number(roomId))) {
                return;
            }

            await prisma.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId
                }
            });

            users.forEach(user => {
                if (user.rooms.includes(String(roomId)) && user.ws !== ws) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    });

    ws.on('close', () => {
        const index = users.findIndex(x => x.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});