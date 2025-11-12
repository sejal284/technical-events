import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected for migration"))
.catch((err) => console.log(err));

async function migrateUsers() {
  try {
    // Find all users without usernames
    const usersWithoutUsernames = await User.find({ username: { $exists: false } });
    
    console.log(`Found ${usersWithoutUsernames.length} users without usernames`);
    
    // Update each user with a generated username
    for (let i = 0; i < usersWithoutUsernames.length; i++) {
      const user = usersWithoutUsernames[i];
      const generatedUsername = `user_${user._id.toString().slice(-6)}_${Date.now()}`;
      
      await User.findByIdAndUpdate(user._id, { 
        username: generatedUsername 
      });
      
      console.log(`Updated user ${user.email} with username: ${generatedUsername}`);
    }
    
    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateUsers();

