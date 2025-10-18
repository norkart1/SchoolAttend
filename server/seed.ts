import { db } from "./db";
import { admins } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Check if admin already exists
  const existing = await db.select().from(admins).where(eq(admins.username, "admin"));

  if (existing.length === 0) {
    // Hash the default password
    const hashedPassword = await bcrypt.hash("12345", 10);

    // Create default admin user with hashed password
    await db.insert(admins).values({
      username: "admin",
      password: hashedPassword,
    });
    console.log("✓ Created default admin user (username: admin, password: 12345)");
  } else {
    console.log("✓ Admin user already exists");
    
    // Update existing admin password to hashed version if it's not already hashed
    const admin = existing[0];
    if (!admin.password.startsWith("$2")) { // bcrypt hashes start with $2
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await db.update(admins).set({ password: hashedPassword }).where(eq(admins.id, admin.id));
      console.log("✓ Updated admin password to hashed version");
    }
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
