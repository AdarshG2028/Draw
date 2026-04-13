import "dotenv/config"
import express from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types"
import { prisma } from "@repo/db";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors({
  origin : "*"
}));

console.log(process.env.DATABASE_URL)

app.post("/signup", async (req, res) => {

  console.log(process.env.DATABASE_URL)
  const ParsedData = CreateUserSchema.safeParse(req.body);
  if (!ParsedData.success) {
    res.json({
      message: "Incorrect inputs"
    })
    return;
  }
  try {
    //hash the password
    const user = await prisma.user.create({
      data: {
        email: ParsedData.data?.email,
        password: ParsedData.data?.password,
        name: ParsedData.data?.name
      }
    })

    res.json({
      userId: user.id
    })
  }
  catch (e) {
    res.status(411).json({
      message: "Email already exists"
    })
    console.log(e);

  }

})

app.post("/signin", async (req, res) => {
  const ParsedData = SigninSchema.safeParse(req.body);
  if (!ParsedData.success) {
    res.json({
      message: "Incorrect inputs"
    })
    return;
  }
  //Check for hashed passwords
  const user = await prisma.user.findFirst({
    where: {
      email: ParsedData.data?.email,
      password: ParsedData.data?.password
    }
  })


  if (!user) {
    res.json({
      message: "Not Authorized"
    })
    return;
  }

  const userId = user.id;
  const token = jwt.sign({
    userId
  }, JWT_SECRET)

  res.json({
    token
  })

})

app.post("/rooms", middleware, async (req, res) => {
  const ParsedData = CreateRoomSchema.safeParse(req.body);
  if (!ParsedData.success) {
    res.json({
      message: "Incorrect inputs"
    })
    return;
  }
  //@ts-ignore
  const userId = req.UserId;
  console.log(userId)
  try {
    const room = await prisma.room.create({
      data: {
        slug: ParsedData.data?.roomName,
        adminId: userId
      }
    })

    res.json({
      roomId: room.id
    })


  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name"
    })
    console.log(e)
  }

})

app.get("/", (req, res) => {
  res.send("Server is running 🚀")
})

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);

  if (isNaN(roomId)) {
      res.json({
          messages: []
      });
      return;
  }

  try {
    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId
      },
      orderBy: {
        id: "desc"
      },
      take: 1000

    });

    res.json({
      messages
    })
  } catch (e) {
    console.log(e)
    res.json({
      messages: []
    })
  }

})

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prisma.room.findFirst({
    where: {
      slug: slug
    }
  })
  res.json({
    room
  })

})

app.listen(3000);
