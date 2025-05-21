require("dotenv").config();
const express = require("express");
const axios = require("axios");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const Tesseract = require("tesseract.js");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");
const Chat = require("../models/Chat");
const SupportMessage = require("../models/SupportMessage");
const KYC = require("../models/KycApproval");
const flash = require("connect-flash");
const Religion = require("../models/Religion");
const MotherTongue = require("../models/MotherTongue");
const RestrictedWord = require("../models/RestrictedWord");
const City = require("../models/Cities");
const Height = require("../models/Height");
const KundaliMatch = require("../models/KundaliMatch");
const ExcelJS = require("exceljs")
const Country = require("../models/Country");
const Degree = require("../models/Degree");
const Plan = require("../models/Plan");
const SuccessStory = require("../models/SucessStories");
const SuccessStoryRequest = require("../models/SuccessStoryRequest");
const PromoCode = require("../models/PromoCode");
const JobSector = require("../models/JobSector");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { request } = require("http");
const { console } = require("inspector");




const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "A",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });


function getPermissions(adminValue) {
  if (typeof adminValue !== "number" || adminValue <= 0) {
    throw new Error("Invalid adminValue. It must be a positive number.");
  }

  const permissionMap = {
    1: "cordinator",
    2: "kyc-details",
    3: "sucess-stories",
    4: "kundali-request",
    5: "support-chat",
    6: "revenue",
    7: "download-users",
    8: "promo-code",
    9: "create-cordinator"
  };

  const permissions = adminValue
    .toString()
    .split("")
    .map((digit) => permissionMap[digit])
    .filter((permission) => permission);

  return permissions;
}



router.get("/login", async(req, res)=>{

  try {
    return res.render("login");
  } catch (error) {
    console.error("Error fetching :", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }

});

router.get("/coordinator", async (req, res) => {
  const coordinators = await User.find({ admin: { $gt: 0 } }).select("fullname email phone admin");

  const coordinatorList = coordinators.map((user) => ({
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
    permissions: getPermissions(user.admin)
  }));

  res.render("cordinator", { coordinatorList });
});

router.post("/coordinator-create", async (req, res) => {
  const { fullname, email, phone, password } = req.body;

  try {
    const existing = await User.findOne({ phone });
    const existing2 = await User.findOne({ email });
    if (existing) return res.status(400).send("phone already exists.");
    if (existing2) return res.status(400).send("email already exists.");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoordinator = new User({
      fullname,
      email,
      phone,
      address: "Cordinator",
      password: hashedPassword,
      admin: 1
    });

    await newCoordinator.save();
    res.redirect("/coordinator");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

router.post("/coordinator-update-permissions", async (req, res) => {
  const { phone, permissions } = req.body;

  if (!phone) {
    return res.status(400).send("Phone number is required");
  }

  let adminValue = 1;

  if (permissions) {
    const digits = Array.isArray(permissions) ? permissions : [permissions];
    const uniqueSortedDigits = [...new Set(digits)].sort();
    adminValue = parseInt(uniqueSortedDigits.join(""));
  }

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.admin = adminValue;
    await user.save();

    
    req.flash("error", "Permissions updated successfully!");
    res.redirect("/coordinator");
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/", async (req, res) => {
  try {
     const currUser = req.user;
    if (currUser) {
      if (currUser.admin > 0){

        const userPermissions = getPermissions(currUser.admin);
        res.render("home", {userPermissions, currUser});
      }else{
        res.redirect("/login");
      }
     
    } else {
      res.redirect("/login");
    }
    
  } catch (error) {
    console.log(error);
  }
});


router.get('/kyc-details', async (req, res) => {
  const kycsApproved = await KYC.find({ approval: true }).populate('user');
  const kycsPending = await KYC.find({ approval: false }).populate('user');
  res.render('kyc', { kycsApproved, kycsPending });
});


router.post('/approve/:id', async (req, res) => {
  await KYC.findByIdAndUpdate(req.params.id, { approval: true });

  res.redirect('/kyc-details');
});



router.post('/delete/:id', async (req, res) => {
  await KYC.findByIdAndDelete(req.params.id);
  res.redirect('/kyc-details');
});



router.get("/promo-code", async (req, res) => {
  try {
    const currUser = req.user;

    if (!currUser) {
      return res.redirect("/login");
    }

    const plans = await Plan.find();
    const promoCodesRaw = await PromoCode.find()
      .populate("usedBy.userId", "fullname _id") 
      .populate("usedBy.planId"); 

    const promoCodes = promoCodesRaw.map(promo => ({
      _id: promo._id,
      code: promo.code,
      discount: promo.discount,
      usedCount: promo.usedBy.length,
      usageDetails: promo.usedBy.map(use => ({
        userId: use.userId?._id,
        userName: use.userId?.fullname || "Unknown",
        plan: use.planId,
        usedAt: use.usedAt,
      }))
    }));

    res.render("promo-info", {
      promoCodes,
      plans,
    });

  } catch (error) {
    console.error("Error in /promo-code route:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/send-promo", async (req, res) => {
  const { planName, code } = req.body;

  try {
    const users = await User.find({ "plan.name": planName });
     const promoCode = await PromoCode.find({ "code": code });

     if(!promoCode){
      
      req.flash("error", "Promocode not exist!");
      res.redirect("/promo-code");
     }

      const discount = promoCode.discount;
    
    const updatePromises = users.map(user => {
      if (user.promoCodes.length >= 3) {
        user.promoCodes.shift(); 
      }
      user.promoCodes.push({ code, discount });
      return user.save();
    });
    

    await Promise.all(updatePromises);
    req.flash("error", "Promocode sended Sucessfully!");
    res.redirect("/promo-code");
  } catch (err) {
    req.flash("error", "Promocode sended Sucessfully!");
    res.redirect("/promo-code");
  }
});


router.post("/create-promocode", async (req, res) => {
  try {
    const { code, discount } = req.body;

    if (!code || !discount) {
      return res.status(400).send("All fields are required.");
    }

    const newPromo = new PromoCode({ code, discount });
    await newPromo.save();
    req.flash("error", "Promocode Created Sucessfully!");
    res.redirect("/promo-code");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/success-stories", async(req, res)=>{
  const currUser = req.user;
  try {
    if(currUser.admin>0){
    
      const pendingStories = await SuccessStoryRequest.find({ status: "Pending" })
      .populate('user', 'fullname phone email')
      .sort({ createdAt: -1 }); 

      res.render("sucess-story-request", {currUser, pendingStories});
      


    }else{

    }
    
  } catch (error) {
    
  }

});


router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    res.render("userProfile", { user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Server error");
  }
});


router.get('/check/:phone', async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.json({ status: 'not_found' });

    const kyc = await KYC.findOne({ user: user._id });
    if (!kyc) return res.json({ status: 'no_kyc' });

    res.json({
      status: kyc.approval ? 'approved' : 'pending',
      fullname: user.fullname,
      imageUrl: kyc.imageUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});


router.get("/kundali-requests", async (req, res) => {
  try {
    const matches = await KundaliMatch.find();
    res.render("kundali", { matches });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});


router.post("/kundali-approve/:id", async (req, res) => {
  const { pdfLink } = req.body;
  try {
    await KundaliMatch.findByIdAndUpdate(req.params.id, {
      pdfLink,
      approved: !!pdfLink
    });
    res.redirect("/kundali-requests");
  } catch (err) {
    res.status(500).send("Update failed");
  }
});

router.get("/sucess-story-available", async (req, res)=>{
  try {

    const SuccessStories = await SuccessStory.find();

    res.render("sucess-story-available", {SuccessStories});
    
  } catch (error) {
    
  }
})

router.post('/success-story-delete/:id', async (req, res) => {
  try {
    const storyId = req.params.id;

    const deletedStory = await SuccessStory.findByIdAndDelete(storyId);

    if (!deletedStory) {
      return res.status(404).send('Success story not found');
    }

    res.redirect('/sucess-story-available');
  } catch (error) {
    console.error('Error deleting success story:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get("/revenue", async (req, res) => {
  try {
    const users = await User.find();
    const plans = await Plan.find();

    const revenueData = {};
    plans.forEach(plan => {
      revenueData[plan.name] = {
        count: 0,
        price: plan.price,
        total: 0
      };
    });

    users.forEach(user => {
      const planName = user.plan?.name;
      if (planName && planName.toLowerCase() !== "free" && revenueData[planName]) {
        revenueData[planName].count++;
        revenueData[planName].total = revenueData[planName].count * revenueData[planName].price;
      }
    });

    const totalRevenue = Object.values(revenueData).reduce((acc, plan) => acc + plan.total, 0);

    res.render("revenue", { revenueData, totalRevenue });

  } catch (error) {
    console.error("Error generating revenue page:", error);
    res.status(500).send("Internal Server Error");
  }
});



router.get("/revenue/download", async (req, res) => {
  try {
    const users = await User.find();
    const plans = await Plan.find();

    const revenueData = {};
    plans.forEach(plan => {
      revenueData[plan.name] = {
        count: 0,
        price: plan.price,
        total: 0
      };
    });

    users.forEach(user => {
      const planName = user.plan?.name;
      if (planName && planName.toLowerCase() !== "free" && revenueData[planName]) {
        revenueData[planName].count++;
        revenueData[planName].total = revenueData[planName].count * revenueData[planName].price;
      }
    });

    const totalRevenue = Object.values(revenueData).reduce((acc, plan) => acc + plan.total, 0);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Revenue");

    sheet.columns = [
      { header: "Plan Name", key: "name", width: 20 },
      { header: "Price", key: "price", width: 15 },
      { header: "Sold", key: "count", width: 10 },
      { header: "Total Revenue", key: "total", width: 20 }
    ];

    for (const planName in revenueData) {
      const data = revenueData[planName];
      sheet.addRow({
        name: planName,
        price: data.price,
        count: data.count,
        total: data.total
      });
    }

    sheet.addRow([]);
    sheet.addRow({
      name: "Total",
      total: totalRevenue
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=revenue.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error downloading Excel:", error);
    res.status(500).send("Internal Server Error");
  }
});


function calculateRemainingDays(date) {
  if (!date) return "N/A";
  const today = new Date();
  const expiry = new Date(date);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0 ? "Expired" : diffDays + " days left";
}

router.get("/download-users", async (req, res) => {
  try {
    const users = await User.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = [
      { header: "Full Name", key: "fullname", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Address", key: "address", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Plan Name", key: "planName", width: 15 },
      { header: "Plan Views", key: "planViews", width: 12 },
      { header: "Plan Contacts", key: "planContacts", width: 15 },
      { header: "Plan Interests", key: "planIntrests", width: 15 },
      { header: "Plan Shortlists", key: "planShortlis", width: 15 },
      { header: "Plan Valid Until", key: "planValidUntil", width: 20 },
      { header: "Plan Expires In", key: "planExpiresIn", width: 18 },
      { header: "Sponsorship Active", key: "sponsorshipActive", width: 18 },
      { header: "Sponsorship Expiry", key: "sponsorshipExpiry", width: 20 },
      { header: "Sponsorship Expires In", key: "sponsorshipExpiresIn", width: 22 },
    ];

    
    users.forEach(user => {
      worksheet.addRow({
        fullname: user.fullname,
        email: user.email,
        address: user.address,
        phone: user.phone,
        planName: user.plan?.name || "Free",
        planViews: user.plan?.views ?? 0,
        planContacts: user.plan?.contacts ?? 0,
        planIntrests: user.plan?.intrests ?? 0,
        planShortlis: user.plan?.shortlis ?? 0,
        planValidUntil: user.plan?.validUntil ? new Date(user.plan.validUntil).toLocaleDateString() : "N/A",
        planExpiresIn: calculateRemainingDays(user.plan?.validUntil),
        sponsorshipActive: user.sponsorship?.isActive ? "Yes" : "No",
        sponsorshipExpiry: user.sponsorship?.expiryDate ? new Date(user.sponsorship.expiryDate).toLocaleDateString() : "N/A",
        sponsorshipExpiresIn: calculateRemainingDays(user.sponsorship?.expiryDate),
      });
    });

    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error generating user Excel:", error);
    res.status(500).send("Internal Server Error");
  }
});




router.post('/success-story/approve/:id', async (req, res) => {
  try {
    const request = await SuccessStoryRequest.findById(req.params.id);

    if (!request) return res.status(404).send("Request not found.");

  
    await SuccessStoryRequest.findByIdAndUpdate(req.params.id, { status: "Approved" });

    
    const newStory = new SuccessStory({
      photo: request.image,
      coupleName: `${request.name} ❤️ ${request.partnerName}`,
      comment: request.quote
    });

    await newStory.save();

    res.redirect('/success-stories');

  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).send("Approval and story creation failed.");
  }
});

router.get("/support", async (req, res) => {
  
  const users = await SupportMessage.aggregate([
    { $match: { isAdmin: false } },
    { $sort: { createdAt: -1 } }, 
    {
      $group: {
        _id: "$user",
        latestMessageAt: { $first: "$createdAt" }
      }
    }
  ]);

  const userDetails = await User.find({ _id: { $in: users.map(u => u._id) } });
  res.render("support", { users: userDetails });
});

router.get("/support/:userId", async (req, res) => {
  const { userId } = req.params;
  const messages = await SupportMessage.find({ user: userId })
    .sort({ createdAt: 1 })
    .populate("user");
  res.render("support-chat", { messages, userId });
});


router.post("/support/:userId", async (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;

  if (!message) return res.redirect(`/support/${userId}`);

  await SupportMessage.create({
    user: userId,
    message,
    isAdmin: true
  });

  res.redirect(`/support/${userId}`);
});


router.post('/success-story/reject/:id', async (req, res) => {
  try {
    await SuccessStoryRequest.findByIdAndUpdate(req.params.id, { status: "Rejected" });
    res.redirect('/success-stories');
  } catch (error) {
    res.status(500).send("Rejection failed.");
  }
});

router.post("/delete-img", async (req, res) => {
  try {
    const currUser = req.user;
    if (!currUser) {
      req.flash("error", "Unauthorized. Please log in.");
      return res.redirect("/profile");
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      req.flash("error", "Invalid request.");
      return res.redirect("/profile");
    }

    const publicId = imageUrl.split("/").slice(-2).join("/").split(".")[0];

    console.log("Deleting Image with Public ID:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary Deletion Result:", result);

    if (result.result !== "ok") {
      req.flash("error", "Failed to delete image from Cloudinary.");
      return res.redirect("/profile");
    }

    
    currUser.images = currUser.images.filter((img) => img !== imageUrl);
    await currUser.save(); 

    console.log("Image removed from user data.");

    req.flash("success", "Image deleted successfully.");
    res.redirect("/profile");
  } catch (error) {
    console.error("Server error:", error);
    req.flash("error", "Server error: " + error.message);
    res.redirect("/profile");
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication error:", err);
      req.flash("error", "Server error. Please try again.");
      return res.redirect("/");
    }
    if (!user) {
      req.flash("error", info.message);
      return res.redirect("/");
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Login failed:", err);
        req.flash("error", "Login failed. Please try again.");
        return res.redirect("/");
      }

      res.redirect("/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect("/");
  });
});

module.exports = router;
