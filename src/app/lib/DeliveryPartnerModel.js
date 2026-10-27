
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const deliveryPartnerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Password ko database mein save karne se pehle hash karein.
deliveryPartnerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const DeliveryPartner =
  mongoose.models.DeliveryPartner ||
  mongoose.model("DeliveryPartner", deliveryPartnerSchema);

export default DeliveryPartner;
