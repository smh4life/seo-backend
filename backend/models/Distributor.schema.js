import mongoose from "mongoose";

const DistributorSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  columnMap: { type: Object, default: {} },
  schema: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model("Distributor", DistributorSchema);

