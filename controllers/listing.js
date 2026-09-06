const Listing = require('../models/listing.js');

module.exports.index = async (req, res) => {

    const { category } = req.query;

    let allListings;

    if (category) {
        allListings = await Listing.find({
            category: category
        });
    } else {
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
        allListings
    });

};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.search = async (req, res) => {
    const { q } = req.query;

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListings });
};

module.exports.showListings = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    res.render("listings/show.ejs",{listing});
};




module.exports.createListing = async (req, res) => {

    // Create listing from form data
    const newListing = new Listing(req.body.listing);


    // ================= IMAGE =================

    if (req.file) {

        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };

    } else {

        newListing.image = {
            url: "https://jooinn.com/images/hotel-1.jpg",
            filename: "listingimage"
        };

    }


    // ================= GEOAPIFY =================

    const location = req.body.listing.location;

    const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&format=geojson&apiKey=${process.env.GEOAPIFY_API_KEY}`
    );


    const data = await response.json();


    // Check if location was found

    if (!data.features || data.features.length === 0) {

        req.flash("error", "Location not found. Please enter a valid location.");

        return res.redirect("/listings/new");

    }


    // Geoapify gives:
    // [longitude, latitude]

    const coordinates = data.features[0].geometry.coordinates;


    // Save geometry in MongoDB

    newListing.geometry = {

        type: "Point",

        coordinates: coordinates

    };


    // ================= OWNER =================

    newListing.owner = req.user._id;


    // ================= SAVE =================

    await newListing.save();


    req.flash("success", "New Listing Created!");

    res.redirect(`/listings/${newListing._id}`);
};




module.exports.renderEditForm = async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested doesn't exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300/w_250");


    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };

    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted !");
    res.redirect("/listings");
}