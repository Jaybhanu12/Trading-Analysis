import mongoose from "mongoose";
import { Schema } from "mongoose";

const marketCapSchema = new Schema(
    {
      symbol: String,
      company_Name: String,
      macro: String,
      sector: String,
      industry: String,
      basic_Industry: String,
      last_Price: Number,
      previous_Last_Price: Number,
      total_Market_Cap: Number,
      date: Date,
      categorizationData: String,
    },{
        timestamps: true
    })


    export const Marketcap = mongoose.model("Marketcap",marketCapSchema);