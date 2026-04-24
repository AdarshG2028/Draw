"use client"
import { useEffect, useState } from "react";
import { WS_URL } from "../../config";
import Canvas from "./canvas";


export default function RoomCanvas({roomId} : {roomId : string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);
    useEffect(()=>{
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYjM5MjA0Zi05NzMxLTQ3ZjctYTk2My05NGYyMTM0NzZjMGMiLCJpYXQiOjE3NzYyNzYzMDB9.MQkuE0aoQvSbU9HPQBqCBJSLJeugzUZUqy_Y43Tyjm0`);
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