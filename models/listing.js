const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review.js");

let listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://jooinn.com/images/hotel-1.jpg"
        }
    },

    price: {
        type: Number
    },

    location: {
        type: String
    },

    country: {
        type: String
    },

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },

        coordinates: {
            type: [Number],
            required: true
        }
    },
    category: {
    type: String,
    enum: [
        "Trending",
        "Rooms",
        "Iconic Cities",
        "Mountain",
        "Castles",
        "Amazing pool",
        "Camping",
        "Farms",
        "Arctic"
    ]
},

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;