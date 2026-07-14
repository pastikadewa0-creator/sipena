import mongoose, { Document, Model } from 'mongoose'

export interface ISetting extends Document {
  key: string
  value: string
  createdAt: Date
  updatedAt: Date
}

const SettingSchema = new mongoose.Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
)

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema)

export default Setting
