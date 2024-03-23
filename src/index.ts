import "@sapphire/plugin-logger/register";

import { config } from "dotenv";
config();

import { JoewyClient } from "./client/JoewyClient";

new JoewyClient().start(process.env.TOKEN!);
