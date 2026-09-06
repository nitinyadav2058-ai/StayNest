const User = require("../models/user");

module.exports.renderloginForm = (req,res)=>{
    res.render("user/login.ejs");
};


module.exports.signup = async(req,res,next)=>{
    try{
    let {username,email,password} = req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            next(err);
        }
        req.flash("success","Welcome to StayNest");
        res.redirect("/listings");
    });
    
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signUp")
    }
    
};

module.exports.renderSignUpForm = (req,res)=>{
    res.render("user/signUp.ejs");
}

module.exports.login = async(req,res)=>{
    req.flash("success","Welcome to StayNest you are logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}


module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You logged out successfully!");
        res.redirect("/listings");
    });
};