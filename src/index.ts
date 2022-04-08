import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import "@sapphire/plugin-api/register";
import { Client } from "./client/client";
import { container } from "@sapphire/framework";

container.database = prisma;

const client = new Client();
void client.login(process.env.TOKEN!);
