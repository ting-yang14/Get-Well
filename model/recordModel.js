import mongoose from "mongoose";
const recordSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    exerciseName: {
      type: String,
      required: [true, "Please filled in exercise name"],
    },
    exerciseCounts: {
      type: Number,
      required: [true, "Please filled in exercise counts"],
    },
    exerciseRecord: {
      startTime: { type: String, required: true },
      data: {
        type: [
          {
            acc_X: { type: Number, required: true },
            acc_Y: { type: Number, required: true },
            acc_Z: { type: Number, required: true },
            ori_alpha: { type: Number, required: true },
            ori_beta: { type: Number, required: true },
            ori_gamma: { type: Number, required: true },
            time: { type: Date, required: true },
          },
        ],
        required: true,
      },
      endTime: { type: String, required: true },
    },

    videoFileName: { type: String, required: true },
  },
  { timestamps: true }
);
export const Record = mongoose.model("Record", recordSchema);
