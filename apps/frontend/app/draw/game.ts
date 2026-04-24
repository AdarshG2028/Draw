import { Tool } from "@/components/canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor: string;
} | {
    type: "circle";
    CenterX: number;
    CenterY: number;
    radiusX: number;
    radiusY: number;
    backgroundColor: string;
} | {
    type: "line";
    StartX: number;
    StartY: number;
    EndX: number;
    EndY: number;
    color: string;
} |{
    type : "pencil",
    points :[number,number][];
    color : string;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: Boolean;
    private startX = 0;
    private draggedShape : Shape | null = null;
    private color :string;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private eraserPath : [number,number][];
    private currentPencilPath: [number, number][] = []

    socket: WebSocket;
    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.socket = socket;
        this.color = "red";
        this.clicked = false;
        this.existingShapes = [];
        this.eraserPath = [];
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "grab" | "eraser" | "line") {
        this.selectedTool = tool; 
    }

    setColor(color: string) {
        this.color = color;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes)
        this.clearCanvas();
    }

    checkIfShapeExists(shape :Shape){
        return this.existingShapes.indexOf(shape) !== -1;
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type == 'chat') {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        if (message.type === "UPDATE_SHAPES") {
    this.existingShapes = message.shapes || []
    this.clearCanvas()
    console.log("received update")
}
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
               this.ctx.strokeStyle = "rgba(255,255,255)";
               this.ctx.fillStyle = this.color;
               this.ctx.fillStyle = shape.backgroundColor;
               this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            } else if (shape.type === 'circle') {
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.fillStyle = shape.backgroundColor;
                this.ctx.beginPath();
                this.ctx.ellipse(shape.CenterX, shape.CenterY, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();

            } else if (shape.type === 'line') {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.StartX, shape.StartY);
                this.ctx.lineTo(shape.EndX, shape.EndY);
                this.ctx.strokeStyle = shape.color;
                this.ctx.stroke();
            } else if (shape.type === "pencil") {
            const points = shape.points

            this.ctx.beginPath()

            for (let i = 1; i < points.length; i++) {
                this.ctx.moveTo(points[i - 1][0], points[i - 1][1])
                this.ctx.lineTo(points[i][0], points[i][1])
            }

            this.ctx.strokeStyle = shape.color
            this.ctx.stroke()
            }
        })
    }

    findDistance(x1:number , y1:number, x2:number,y2:number):number{
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    }

    isPointInRect(x, y, shape) {
    if (!shape || shape.type !== "rect") return false

    const minX = Math.min(shape.x, shape.x + shape.width)
    const maxX = Math.max(shape.x, shape.x + shape.width)
    const minY = Math.min(shape.y, shape.y + shape.height)
    const maxY = Math.max(shape.y, shape.y + shape.height)

    return x >= minX && x <= maxX && y >= minY && y <= maxY
   }

    isPointInCircle(x : number , y :number , shape:Shape): boolean {
        if(!shape || shape.type !== "circle") return false;
        return(
            (x-shape.CenterX)**2 / shape.radiusX**2 + (y-shape.CenterY)**2 / shape.radiusY**2 <= 1
        )
    }

    isPointInLine(x, y, shape) {
    if (!shape || shape.type !== "line") return false

    const A = x - shape.StartX
    const B = y - shape.StartY
    const C = shape.EndX - shape.StartX
    const D = shape.EndY - shape.StartY

    const dot = A * C + B * D
    const len_sq = C * C + D * D
    const param = len_sq !== 0 ? dot / len_sq : -1

    let xx, yy

    if (param < 0) {
        xx = shape.StartX
        yy = shape.StartY
    } else if (param > 1) {
        xx = shape.EndX
        yy = shape.EndY
    } else {
        xx = shape.StartX + param * C
        yy = shape.StartY + param * D
    }

    const dx = x - xx
    const dy = y - yy

    return Math.sqrt(dx * dx + dy * dy) < 5
}

isPointInPencil(x, y, shape) {
    if (!shape || shape.type !== "pencil") return false

    for (let i = 1; i < shape.points.length; i++) {
        const x1 = shape.points[i - 1][0]
        const y1 = shape.points[i - 1][1]
        const x2 = shape.points[i][0]
        const y2 = shape.points[i][1]

        const dx = x2 - x1
        const dy = y2 - y1

        const length = dx * dx + dy * dy
        const t = ((x - x1) * dx + (y - y1) * dy) / length

        let px, py

        if (t < 0) {
            px = x1
            py = y1
        } else if (t > 1) {
            px = x2
            py = y2
        } else {
            px = x1 + t * dx
            py = y1 + t * dy
        }

        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2)

        if (dist < 5) return true
    }

    return false
}

    mouseDownHandler = (e) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.selectedTool === "grab") {
            for (let i = this.existingShapes.length - 1; i >= 0; i--) {
                const shape = this.existingShapes[i];
                if (this.isPointInCircle(e.clientX, e.clientY, shape) || this.isPointInLine(e.clientX, e.clientY, shape) || this.isPointInRect(e.clientX, e.clientY, shape) || this.isPointInPencil(e.clientX, e.clientY, shape)) {
                    this.draggedShape = shape;
                    break;
                }
            }
            if (this.draggedShape) {
                this.existingShapes = this.existingShapes.filter(shape => shape !== this.draggedShape);
                this.existingShapes.push(this.draggedShape);
            }
        }
        if(this.selectedTool == "eraser"){
            this.eraserPath.push([e.clientX,e.clientY]);
            this.clearCanvas(); 
        }
        if (this.selectedTool === "pencil") {
        this.currentPencilPath = []
        this.currentPencilPath.push([e.clientX, e.clientY])
}
    }

    mouseUpHandler = (e) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;


        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
                backgroundColor : this.color
            }
        } else if (this.selectedTool === 'circle') {
            const radiusX = width / 2;
            const radiusY = height / 2;
            shape = {
                type: "circle",
                CenterX: this.startX + radiusX,
                CenterY: this.startY + radiusY,
                radiusX: Math.abs(radiusX),
                radiusY: Math.abs(radiusY),
                backgroundColor: this.color
            }
        } else if(this.selectedTool === "line"){
            shape = {
                type : "line",
                StartX : this.startX,
                StartY : this.startY,
                EndX : e.clientX,
                EndY : e.clientY,
                color : this.color
            }
        } else if(this.selectedTool === "eraser"){
            this.existingShapes = this.existingShapes.filter((shape) =>{
                if(!shape) return false;
                return !this.eraserPath.some((point) =>{
                    return this.isPointInCircle(point[0],point[1],shape) || this.isPointInLine(point[0],point[1],shape) || this.isPointInRect(point[0],point[1],shape) || this.isPointInPencil(point[0],point[1],shape)
                })
            })
            
            this.clearCanvas();
        } else if(this.selectedTool === "grab"){
            this.draggedShape = null;
        } else if (this.selectedTool === "pencil") {
            shape = {
                type: "pencil",
                points: this.currentPencilPath,
                color: this.color
            }
        }
        this.eraserPath = [];
        

        

        if(shape){
            this.existingShapes.push(shape);
        // this.clearCanvas()
        console.log(shape)

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
        }

        if(selectedTool ==="grab" ||selectedTool === "eraser"){
       this.socket.send(JSON.stringify({
    type: "UPDATE_SHAPES",
    shapes: this.existingShapes,
    roomId: this.roomId
}))
        }
        
    }

    mouseMoveHandler = (e) => {
        if (!this.clicked) {
            return;
        }
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            this.clearCanvas();

            this.ctx.strokeStyle = "rgba(255,255,255)";
            const selectedTool = this.selectedTool;
            console.log(selectedTool)
            if (selectedTool === "rect") {
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.fillStyle = this.color;
                this.ctx.fillRect(this.startX, this.startY, width, height);
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === 'circle') {
                const radiusX = (width / 2);
                const radiusY = (height / 2);
                
                this.ctx.strokeStyle = "rgba(255,255,255)";
                this.ctx.fillStyle = this.color;
                this.ctx.beginPath();
                this.ctx.ellipse(this.startX + radiusX, this.startY + radiusY, Math.abs(radiusX), Math.abs(radiusY), 0, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.closePath();
            } else if(selectedTool ==='grab' && this.draggedShape){
                let dx = e.clientX - this.startX;
                let dy = e.clientY - this.startY;
                if(this.draggedShape.type === "rect"){
                    this.draggedShape.x += dx;
                    this.draggedShape.y += dy;
                } else if (this.draggedShape.type === 'circle'){
                    this.draggedShape.CenterX += dx;
                    this.draggedShape.CenterY += dy;
                } else if (this.draggedShape.type === 'line'){
                    this.draggedShape.StartX += dx;
                    this.draggedShape.StartY += dy;
                    this.draggedShape.EndX += dx;
                    this.draggedShape.EndY += dy;
                } else if (this.draggedShape.type === 'pencil') {
                    this.draggedShape.points = this.draggedShape.points.map(point => [point[0] + dx, point[1] + dy]);
                }
                this.startX = e.clientX;
                this.startY = e.clientY;

            } else if (selectedTool === 'eraser'){
                this.eraserPath.push([e.clientX,e.clientY]);
                
            } else if (selectedTool === 'line'){
                this.ctx.beginPath();
                this.ctx.fillStyle = this.color;
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
            } else if (selectedTool === "pencil") {
                this.currentPencilPath.push([e.clientX, e.clientY])

                this.ctx.beginPath()
                const points = this.currentPencilPath

                for (let i = 1; i < points.length; i++) {
                    this.ctx.moveTo(points[i - 1][0], points[i - 1][1])
                    this.ctx.lineTo(points[i][0], points[i][1])
                }

                this.ctx.strokeStyle = this.color
                this.ctx.stroke()
            }

        }

    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    }


}

