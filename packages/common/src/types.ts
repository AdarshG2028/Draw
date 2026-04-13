import z, { email } from "zod"

export const CreateUserSchema = z.object({
    email : z.string().min(3).max(20),
    password: z.string(),
    name: z.string()

})

export const SigninSchema = z.object({
    email : z.string().min(3).max(20),
    password: z.string(),
})

export const CreateRoomSchema = z.object({
    roomName : z.string().min(3).max(20),
})