import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId : string){
    const res = await axios.get(`${HTTP_BACKEND}/room/${roomId}/state`)
    return res.data.snapshot || [];
}

