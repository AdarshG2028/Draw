'use client'
import initDraw from "@/app/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {  Circle, Eraser, HandIcon, Slash , Pencil, Square, Type } from "lucide-react";
import { Game } from "@/app/draw/game";

export type Tool = "circle" | "rect" | "pencil" |"grab" |"eraser" | "line" | "text";

export default function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle")
    const [selectedColor,setSelectedColor] = useState<string>("black");

    useEffect(() => {
        if (game) {
            game.setTool(selectedTool);
            game.setColor(selectedColor);
        }
    }, [selectedTool, game,selectedColor]);



    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }
    }, [canvasRef])
    return (
        <div style={{
            height: "100vh",
            overflow: "hidden"
        }}>
            <canvas width={window.innerWidth} height={window.innerHeight} ref={canvasRef}></canvas>
            <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} selectedColor = {selectedColor} setSelectedColor = {setSelectedColor}></TopBar>
        </div>
    )
}

function TopBar({ selectedTool, setSelectedTool,selectedColor,setSelectedColor }: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
    selectedColor : string;
    setSelectedColor : (s: string) => void;
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10,

    }}>

        <div className="flex gap-t">

            <IconButton onClick={() => setSelectedTool("circle")} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>
            <IconButton onClick={() => setSelectedTool("rect")} activated={selectedTool === "rect"} icon={<Square />}></IconButton>
            <IconButton onClick={() => setSelectedTool("line")} activated={selectedTool === "line"} icon={<Slash />}></IconButton>
            <IconButton onClick={() => setSelectedTool("pencil")} activated={selectedTool === "pencil"} icon={<Pencil />}></IconButton>
            <IconButton onClick={() => setSelectedTool("grab")} activated={selectedTool === "grab"} icon={<HandIcon />}></IconButton>
            <IconButton onClick={() => setSelectedTool("text")} activated={selectedTool === "text"} icon={<Type />}></IconButton>
            <IconButton onClick={() => setSelectedTool("eraser")} activated={selectedTool === "eraser"} icon={<Eraser />}></IconButton>
            <input type="color" className="rounded-full h-10 w-10" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
        </div>

    </div>
}