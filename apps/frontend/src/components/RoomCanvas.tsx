"use client"
import { useEffect, useState } from "react";
import { WS_URL } from "../../config";
import Canvas from "./canvas";


export default function RoomCanvas({roomId} : {roomId : string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3Y2UxMzE4MC1lNGFiLTQwMjItODk5OS0wNmY4NTQzMDdmMTQiLCJpYXQiOjE3NzY5NjA4OTV9.9ihSmUE8fKWCETWmNGlsrA-_vh_WAiHxfDbNjYjoAbo`);
        ws.onopen = () =>{
            setSocket(ws);
            const data = JSON.stringify(({
                type : "join_room",
                roomId : Number(roomId),
                
            }))
            console.log(data)
            ws.send(data);
        }
    },[roomId])
    if(!socket){
        return(
            <div>
                Loading...
            </div>
        )
    }
    return(
        <div>
            <Canvas roomId={roomId} socket={socket}></Canvas>
        </div>
    )
}