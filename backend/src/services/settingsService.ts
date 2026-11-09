import settingsModel from "../models/settingsModel";

export const getSettings = async () => {
  const settings = await settingsModel.findOne({ key: "site" }).select("plan updatedAt").lean();
  return settings ?? { plan: null };
};

interface PlanInput {
  url: string;
  width: number;
  height: number;
}

export const updatePlan = async (plan: PlanInput | null) => {
  return await settingsModel
    .findOneAndUpdate(
      { key: "site" },
      plan ? { $set: { plan } } : { $unset: { plan: 1 } },
      { upsert: true, new: true, runValidators: true }
    )
    .select("plan updatedAt")
    .lean();
};
