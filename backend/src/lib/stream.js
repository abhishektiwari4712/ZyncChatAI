//getstream.io use for streaming video call
import {StreamChat} from "stream-chat"
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
  console.error("Stream API Key or Secret Key is missing. ");
}

const streamClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser = async(userData) => {
  try {
     await streamClient.upsertUsers([userData]);
      return userData;
  } catch (error) {
    console.error("Error upstream Stream user", error);
    throw error;
  }
};

export const  generateStreamToken = (userId) =>{
  try {
    // ensure userid is as string
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
     console.error("Error generating Stream Token ", error.message);
     throw error;
  }
};