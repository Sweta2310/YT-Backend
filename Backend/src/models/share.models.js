import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    platform: {
      type: String,
      enum: ["whatsapp", "facebook", "twitter", "linkedin", "copylink", "other"],
      required: true,
    },
    shareLink: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export const Share = mongoose.model("Share", shareSchema);   