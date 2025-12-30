import { connectMongo } from "./mongo.js";

export async function connectDB() {
  await connectMongo();
}
