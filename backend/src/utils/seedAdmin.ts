import { connectDatabase } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { getSystemConfig } from "../services/configService.js";

await connectDatabase();
const email = env.ADMIN_EMAIL.toLowerCase();
const existing = await User.findOne({ email });
if (existing) {
  existing.name = env.ADMIN_NAME;
  existing.role = "admin";
  existing.password = env.ADMIN_PASSWORD;
  await existing.save();
  console.log(`Admin updated: ${email}`);
} else {
  await User.create({ name: env.ADMIN_NAME, email, password: env.ADMIN_PASSWORD, role: "admin" });
  console.log(`Admin created: ${email}`);
}
await getSystemConfig();
process.exit(0);
