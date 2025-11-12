import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));

async function fixUsernameIndex() {
  try {
    // Drop the existing username index
    await User.collection.dropIndex("username_1");
    console.log("Dropped existing username index");
    
    // Create a new sparse unique index
    await User.collection.createIndex({ username: 1 }, { unique: true, sparse: true });
    console.log("Created new sparse unique index for username");
    
    // Update all users without usernames
    const usersWithoutUsernames = await User.find({ username: { $exists: false } });
    console.log(`Found ${usersWithoutUsernames.length} users without usernames`);
    
    for (let i = 0; i < usersWithoutUsernames.length; i++) {
      const user = usersWithoutUsernames[i];
      const generatedUsername = `user_${user._id.toString().slice(-6)}_${Date.now()}`;
      
      await User.findByIdAndUpdate(user._id, { 
        username: generatedUsername 
      });
      
      console.log(`Updated user ${user.email} with username: ${generatedUsername}`);
    }
    
    console.log("Username index fix completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Fix failed:", error);
    process.exit(1);
  }
}

fixUsernameIndex();

