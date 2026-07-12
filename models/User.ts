import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  username: string
  password: string
  role: 'admin' | 'karyawan'
  name: string
  email: string
  position: string
  isActive: boolean
  photoUrl: string
  documentUrl: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'karyawan'], required: true, default: 'karyawan' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    position: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    photoUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

UserSchema.index({ username: 1 }, { unique: true })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
