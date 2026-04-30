import { Tool } from "@/components/canvas";
import { getExistingShapes } from "./http";

type Shape = {
    id: string;
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    backgroundColor: string;
    text?: string;
} | {
    id: string;
    type: "circle";
    CenterX: number;
    CenterY: number;
    radiusX: number;
    radiusY: number;
    backgroundColor: string;
} | {
    id: string;
    type: "line";
    StartX: number;
    StartY: number;
    EndX: number;
    EndY: number;
    color: string;
} |{
    id: string;
    type: "pencil",
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
    private editingShape: Shape | null = null
    private inputEl: HTMLTextAreaElement | null = null
    private mouseMoved = false
    

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

    setTool(tool: "circle" | "pencil" | "rect" | "grab" | "eraser" | "line" | "text") {
        this.selectedTool = tool; 

        this.canvas.style.cursor =
    tool === "text" ? "text" :
    tool === "grab" ? "move" :
    tool === "eraser" ? "not-allowed" :
    "default"


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
            
            if (message.type === "add_shape") {
                this.existingShapes.push(message.shape);
                this.clearCanvas();
            } else if (message.type === "update_text") {
                const shape = this.existingShapes.find(s => s.id === message.shapeId);
                if (shape && shape.type === "rect") {
                    shape.text = message.text;
                    this.clearCanvas();
                }
            } else if (message.type === "move_shape") {
                const index = this.existingShapes.findIndex(s => s.id === message.shape.id);
                if (index !== -1) {
                    this.existingShapes[index] = message.shape;
                    this.clearCanvas();
                }
            } else if (message.type === "delete_shape") {
                this.existingShapes = this.existingShapes.filter(s => s.id !== message.shapeId);
                if (this.editingShape && this.editingShape.id === message.shapeId) {
                    if (this.inputEl && this.inputEl.parentNode) {
                        this.inputEl.parentNode.removeChild(this.inputEl);
                    }
                    this.inputEl = null;
                    this.editingShape = null;
                }
                this.clearCanvas();
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
               if (shape.text) {
  this.drawWrappedText(
    shape.text,
    shape.x + 5,
    shape.y + 5,
    shape.width - 10,
    shape.height - 10
  )
}
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
    startEditing(shape: Shape) {
  if (!shape || shape.type !== "rect") return

  this.editingShape = shape

  if (!this.inputEl) {
    this.inputEl = document.createElement("textarea")
    document.body.appendChild(this.inputEl)
    this.inputEl.onblur = () => this.stopEditing()
  }

  this.inputEl.value = shape.text || ""

  this.inputEl.style.position = "absolute"
  this.inputEl.style.left = `${shape.x + 5}px`
  this.inputEl.style.top = `${shape.y + 5}px`
  this.inputEl.style.width = `${shape.width - 10}px`
  this.inputEl.style.height = `${shape.height - 10}px`
  this.inputEl.style.background = "transparent"
  this.inputEl.style.color = "white"
  this.inputEl.style.border = "none"
  this.inputEl.style.outline = "none"
  this.inputEl.style.resize = "none"
  this.inputEl.style.overflow = "hidden"
  this.inputEl.style.whiteSpace = "pre-wrap"

  this.inputEl.focus()
}

stopEditing() {
  if (!this.editingShape || !this.inputEl) return

  if (this.editingShape.type === "rect") {
    this.editingShape.text = this.inputEl.value

    this.socket.send(JSON.stringify({
      type: "update_text",
      shapeId: this.editingShape.id,
      text: this.editingShape.text,
      roomId: this.roomId
    }))
  }

  if (this.inputEl && this.inputEl.parentNode) {
    this.inputEl.parentNode.removeChild(this.inputEl)
  }
  this.inputEl = null
  this.editingShape = null
  this.clearCanvas()
}



drawWrappedText(text: string, x: number, y: number, maxWidth: number, maxHeight: number) {
  this.ctx.save()
  this.ctx.beginPath()
  this.ctx.rect(x, y, maxWidth, maxHeight)
  this.ctx.clip()

  this.ctx.fillStyle = "white"
  this.ctx.font = "16px Arial"
  this.ctx.textBaseline = "top"

  const words = text.split(" ")
  let line = ""
  let lineHeight = 18
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    let word = words[i]

    if (this.ctx.measureText(word).width > maxWidth) {
      if (line !== "") {
        this.ctx.fillText(line, x, currentY)
        currentY += lineHeight
        line = ""
      }
      for (let j = 0; j < word.length; j++) {
        const testLine = line + word[j]
        if (this.ctx.measureText(testLine).width > maxWidth) {
          if (currentY + lineHeight > y + maxHeight) break
          this.ctx.fillText(line, x, currentY)
          currentY += lineHeight
          line = word[j]
        } else {
          line = testLine
        }
      }
      line += " "
    } else {
      const testLine = line + word + " "
      const metrics = this.ctx.measureText(testLine)

      if (metrics.width > maxWidth) {
        if (currentY + lineHeight > y + maxHeight) break
        this.ctx.fillText(line, x, currentY)
        line = word + " "
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
  }

  if (currentY + lineHeight <= y + maxHeight) {
    this.ctx.fillText(line, x, currentY)
  }

  this.ctx.restore()
}

    mouseDownHandler = (e) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.mouseMoved = false

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
        this.clicked = false

    if (this.selectedTool === "text" && !this.mouseMoved) {
        for (const shape of this.existingShapes) {
            if (this.isPointInRect(e.clientX, e.clientY, shape)) {
            this.startEditing(shape)
            return
            }
        }
}
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        const id = crypto.randomUUID();


        if (this.selectedTool === "rect") {
            shape = {
                id,
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
                id,
                type: "circle",
                CenterX: this.startX + radiusX,
                CenterY: this.startY + radiusY,
                radiusX: Math.abs(radiusX),
                radiusY: Math.abs(radiusY),
                backgroundColor: this.color
            }
        } else if(this.selectedTool === "line"){
            shape = {
                id,
                type : "line",
                StartX : this.startX,
                StartY : this.startY,
                EndX : e.clientX,
                EndY : e.clientY,
                color : this.color
            }
        } else if(this.selectedTool === "eraser"){
            const previousShapes = this.existingShapes;
            this.existingShapes = this.existingShapes.filter((shape) =>{
                if(!shape) return false;
                return !this.eraserPath.some((point) =>{
                    return this.isPointInCircle(point[0],point[1],shape) || this.isPointInLine(point[0],point[1],shape) || this.isPointInRect(point[0],point[1],shape) || this.isPointInPencil(point[0],point[1],shape)
                })
            })
            
            const removedShapes = previousShapes.filter(s => !this.existingShapes.includes(s));
            removedShapes.forEach(s => {
                if (this.editingShape && this.editingShape.id === s.id) {
                    if (this.inputEl && this.inputEl.parentNode) {
                        this.inputEl.parentNode.removeChild(this.inputEl);
                    }
                    this.inputEl = null;
                    this.editingShape = null;
                }
                this.socket.send(JSON.stringify({
                    type: "delete_shape",
                    shapeId: s.id,
                    roomId: this.roomId
                }));
            });
            
            this.clearCanvas();
        } else if(this.selectedTool === "grab"){
            if (this.draggedShape) {
                this.socket.send(JSON.stringify({
                    type: "move_shape",
                    shape: this.draggedShape,
                    roomId: this.roomId
                }));
            }
            this.draggedShape = null;
        } else if (this.selectedTool === "pencil") {
            shape = {
                id,
                type: "pencil",
                points: this.currentPencilPath,
                color: this.color
            }
        } else {
            this.eraserPath = [];
        }

        if(shape){
            this.existingShapes.push(shape);
            // this.clearCanvas()
            console.log(shape)

            this.socket.send(JSON.stringify({
                type: "add_shape",
                shape,
                roomId: this.roomId
            }))
        }
    }
    mouseMoveHandler = (e) => {
        if (!this.clicked) {
            return;
        }
        if (this.clicked) {
                if (
                Math.abs(e.clientX - this.startX) > 5 ||
                Math.abs(e.clientY - this.startY) > 5
                ) {
                    this.mouseMoved = true
                }

            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;

            const selectedTool = this.selectedTool;

            if(selectedTool ==='grab' && this.draggedShape){
                let dx = e.clientX - this.startX;
                let dy = e.clientY - this.startY;
                if(this.draggedShape.type === "rect"){
                    this.draggedShape.x += dx;
                    this.draggedShape.y += dy;

                    if (this.editingShape === this.draggedShape && this.inputEl) {
                        this.inputEl.style.left = `${this.draggedShape.x + 5}px`
                        this.inputEl.style.top = `${this.draggedShape.y + 5}px`
                    }

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
            } else if (selectedTool === "pencil") {
                this.currentPencilPath.push([e.clientX, e.clientY])
            }

            this.clearCanvas();

            this.ctx.strokeStyle = "rgba(255,255,255)";
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
            } else if (selectedTool === 'line'){
                this.ctx.beginPath();
                this.ctx.fillStyle = this.color;
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
            } else if (selectedTool === "pencil") {
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

