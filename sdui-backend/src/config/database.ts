import mongoose from "mongoose";
import env from "./env";

export const connectDatabase = async (): Promise<void> => {
  let retries = 3;

  while (retries > 0) {
    try {
      const options = {
        serverSelectionTimeoutMS: 30000, // Wait up to 30 seconds for server selection
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
        retryWrites: true,
        w: "majority" as const,
      };

      await mongoose.connect(env.mongoUri, options);
      console.log("✅ MongoDB connected successfully to Cluster");

      mongoose.connection.on("error", (error) => {
        console.error("❌ MongoDB connection error details:", error);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected");
      });

      return; // Success - exit the function
    } catch (error) {
      retries--;
      console.error(
        `❌ MongoDB connection attempt failed (${3 - retries}/3):`,
        (error as any).message,
      );

      if (retries > 0) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  // All retries exhausted
  console.error("❌ Failed to connect to MongoDB after 3 attempts");
  console.error(
    "\n⚠️ TROUBLESHOOTING STEPS:\n" +
      "1. Check if your IP is whitelisted in MongoDB Atlas (Network Access)\n" +
      "2. Verify MONGODB_URI in .env file is correct\n" +
      "3. Check your internet connection\n" +
      "4. Verify MongoDB Atlas cluster is running\n" +
      "5. Check firewall/DNS settings\n",
  );
  process.exit(1);
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};
