import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    channel:{
        type: Schema.Types.ObjectId,// subscribing to a channel
        ref: "User",
    },
    isSubscribed: {
        type: Boolean,
        default: true, // Default to true when a subscription is created
    },
},{
    timestamps: true,
})


export const Subscription = mongoose.model("Subscription", subscriptionSchema);