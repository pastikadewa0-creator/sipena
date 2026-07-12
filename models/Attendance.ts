import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IAttendance extends Document {
  userId: Types.ObjectId
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  status: 'hadir' | 'terlambat' | 'alpha'
  documentUrl: string
  createdAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    status: { type: String, enum: ['hadir', 'terlambat', 'alpha'], default: 'hadir' },
    documentUrl: { type: String, default: '' },
  },
  { timestamps: true }
)

// Compound unique index: satu absensi per user per hari
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true })

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)
export default Attendance
