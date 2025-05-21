const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  admin: {type: Number, default:0},
  address: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  kyc: { type: Boolean, default: false },
  adhar: { type: String },
  day: { type: String },
  month: { type: String },
  year: { type: String },
  motherTongue: { type: String },
  casteNoBar: { type: Boolean, default: false },
  manglikStatus: { type: String },
  maritalStatus: { type: String },
  horoscopicMatch: { type: String },
  height: { type: String },
  country: { type: String, default: "India" },
  state: {type: String},
  City: { type: String },
  residentialStatus: { type: String },
  degree: { type: String },
  aboutDegree:{ type: String },
  religion: { type: String },
  cast: { type: String },
  jobSector: { type: String },
  occupation: { type: String },
  annualIncome: { type: String },
  familyType: { type: String },
  fatheroccupationType: { type: String },
  motheroccupation: { type: String },
  brothers: { type: Number },
  marriedBrothers: { type: Number },
  otp: { type: Number },
  sisters: { type: Number },
  marriedSisters: { type: Number },
  age: { type: Number },
  familyLiving: { type: String },
  aboutfamily: { type: String },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users they are interested in
  superInterests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users they are highly interested in
  shortlists:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  phonebook: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  expressYourself: { type: String },
  plan: {
    name: { type: String, default: "Free" }, // Default Free Plan
    views: { type: Number, default: 5 }, // 5 profile views
    chats: { type: Number, default: 5 }, // 5 chats
    contacts: { type: Number, default: 0 }, // 0 contacts
    intrests: { type: Number, default: 0 }, // 0 contacts
    shortlis: { type: Number, default: 0 }, // 0 contacts
    isUnlimited: { type: Boolean, default: false }, // Free plan is limited
    validUntil: { type: Date, default: null } // Plan expiration date (null for Free)
},
  
sponsorship: {
  isActive: { type: Boolean, default: false }, // Indicates if sponsorship is active
  expiryDate: { type: Date, default: null }, 
},
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: props => `You can only upload up to 5 images.`
    }
  },
  partnerWork: {type: String},
  gotra: {type: String},
  gender: {type: String},
  lastSeenTime: { type: Date },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
},
admin: {
  type: Number,
  default: 0 // 0 means customer, >0 means admin/coordinator
},
promoCodes: [
  {
    code: { type: String },
    discount: { type: Number }
  }
]


});

UserSchema.index({ location: "2dsphere" });
const User = mongoose.model("User", UserSchema);
module.exports = User;
