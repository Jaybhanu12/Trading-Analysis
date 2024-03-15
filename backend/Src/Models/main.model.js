import mongoose, { Schema } from "mongoose";

const categorizationModel = new Schema({
  "NSE Symbol": String,
  "Categorization as per SEBI Circular dated Oct 6, 2017": String,
});

export const Categorization = mongoose.model("Categorization", categorizationModel);
