import {z} from "zod";

const registerSchema = z.object({
    username: z.string().min(3).max(10),
    email: z.string().email(),
    password: z.string().min(8).max(10),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(10),
});

export const validateRegister = (data) => {
    return registerSchema.safeParse(data);
};

export const validateLogin = (data) => {
    return loginSchema.safeParse(data);
};

//why safeParse?
//safeParse is a method that returns an object with two properties: data and error.
//data is the data that was parsed successfully.
//error is the error that was thrown if the data was not parsed successfully.
//if the data is parsed successfully, the error will be null.
//if the data is not parsed successfully, the error will be an object with the error message.
//if the data is not parsed successfully, the data will be undefined.
//if the data is parsed successfully, the data will be the data that was parsed successfully.
//if the data is not parsed successfully, the data will be undefined.