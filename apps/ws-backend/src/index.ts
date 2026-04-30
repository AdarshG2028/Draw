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

const roomShapes = new Map<string, any[]>();
const dirtyRooms = new Set<string>();

setInterval(async () => {
    const roomsToSave = Array.from(dirtyRooms);
    dirtyRooms.clear();
    for (const roomId of roomsToSave) {
        const shapes = roomShapes.get(roomId);
        if (shapes) {
            try {
                await prisma.roomState.upsert({
                    where: { roomId: Number(roomId) },
                    update: { snapshot: shapes },
                    create: { roomId: Number(roomId), snapshot: shapes }
                });
            } catch (e) {
                console.error("Failed to save snapshot for room", roomId, e);
                dirtyRooms.add(roomId); // Retry next time
            }
        }
    }
}, 5000);

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
            const roomIdStr = String(parsedData.roomId);
            user.rooms.push(roomIdStr);
            
            if (!roomShapes.has(roomIdStr)) {
                roomShapes.set(roomIdStr, []); // Init empty just in case
                // Optionally load from DB to initialize in memory if it doesn't exist yet
                prisma.roomState.findUnique({
                    where: { roomId: Number(roomIdStr) }
                }).then((dbState: any) => {
                    if (dbState && dbState.snapshot) {
                        roomShapes.set(roomIdStr, dbState.snapshot as any[]);
                    }
                }).catch((e: any) => console.error("Error loading room state:", e));
            }
        }

        if (parsedData.type === "leave_room") {
            const roomId = String(parsedData.roomId);
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x !== roomId)

        }

        if (["add_shape", "update_text", "move_shape", "delete_shape"].includes(parsedData.type)) {
            const roomId = String(parsedData.roomId);
            const shapes = roomShapes.get(roomId) || [];
            
            if (parsedData.type === "add_shape") {
                shapes.push(parsedData.shape);
            } else if (parsedData.type === "update_text") {
                const shape = shapes.find((s: any) => s.id === parsedData.shapeId);
                if (shape) {
                    shape.text = parsedData.text;
                }
            } else if (parsedData.type === "move_shape") {
                const index = shapes.findIndex((s: any) => s.id === parsedData.shape.id);
                if (index !== -1) {
                    shapes[index] = parsedData.shape;
                }
            } else if (parsedData.type === "delete_shape") {
                const index = shapes.findIndex((s: any) => s.id === parsedData.shapeId);
                if (index !== -1) {
                    shapes.splice(index, 1);
                }
            }
            
            roomShapes.set(roomId, shapes);
            dirtyRooms.add(roomId);

            users.forEach(user => {
                if (user.rooms.includes(roomId) && user.ws !== ws) {
                    user.ws.send(JSON.stringify(parsedData));
                }
            });
        }
    });

    ws.on('close', () => {
        const index = users.findIndex(x => x.ws === ws);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});