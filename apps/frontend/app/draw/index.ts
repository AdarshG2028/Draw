// import { canvas } from "@/components/canvas";
import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape = {
    type : "rect";
    x : number;
    y : number;
    width : number;
    height : number;
} | {
    type : "circle";
    centerX : number;
    centerY : number;
    radius : number;
} | {
    type : "line";
    x1 : number;
    y1 : number;
    x2 : number;
    y2 : number;
}

export default async function initDraw(canvasRef : React.RefObject<HTMLCanvasElement>,roomId : string , socket :WebSocket){
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    console.log(existingShapes)


            if(!ctx){
                return;
            }

            // ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
            // ctx.fillRect(0,0,canvas.width,canvas.height);
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if(message.type === "add_shape"){
                    existingShapes.push(message.shape);
                    clearCanvas(existingShapes,canvas,ctx);
                }
            }

            clearCanvas(existingShapes,canvas,ctx);
            let isClicked = false;
            let startX = 0;
            let startY = 0;
            canvas.addEventListener("mousedown",(e)=>{
                isClicked = true;
                startX = e.clientX;
                startY = e.clientY;
                
            })

            canvas.addEventListener("mouseup",(e)=>{
                isClicked = false;
                // const endX = e.clientX;
                // const endY = e.clientY;
                // console.log(endX,endY);
                const width = e.clientX - startX;
                const height = e.clientY - startY;
                existingShapes.push({
                    type : "rect",
                    x : startX,
                    y : startY,
                    width,
                    height
                })
                        const id = crypto.randomUUID()
                        socket.send(JSON.stringify({
            type: "add_shape",
            shape : {
                id,
                type : "rect",
                x : startX,
                y : startY,
                width,
                height
            },
            roomId
        }))
            })

            canvas.addEventListener("mousemove",(e)=>{
                if(isClicked){
                    const width = e.clientX - startX;
                    const height = e.clientY - startY;
                    // ctx.clearRect(0,0,canvas.width,canvas.height);
                    // ctx.fillStyle = "rgba(0, 0, 0, 0.9)"
                    // ctx.fillRect(0,0,canvas.width,canvas.height);
                    clearCanvas(existingShapes,canvas,ctx);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
                    ctx.lineWidth = 2;
                    ctx.strokeRect(startX,startY,width,height);
                }
            })
}

function clearCanvas(existingShapes : Shape[] , canvas : HTMLCanvasElement , ctx : CanvasRenderingContext2D){
     ctx.clearRect(0,0,canvas.width,canvas.height);
     ctx.fillStyle = "rgba(0,0,0,0.9)";
     ctx.fillRect(0,0,canvas.width,canvas.height);

     existingShapes.forEach(shape => {
        if(shape.type === "rect"){
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
        }
        if(shape.type === "circle"){
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI * 2);
            ctx.stroke();
        }
        if(shape.type === "line"){
            ctx.beginPath();
            ctx.moveTo(shape.x1,shape.y1);
            ctx.lineTo(shape.x2,shape.y2);
            ctx.stroke();
        }
     })
}

async function getExistingShapes(roomId: string){
    const res = await axios.get(`${HTTP_BACKEND}/room/${roomId}/state`)
    return res.data.snapshot || [];
}

