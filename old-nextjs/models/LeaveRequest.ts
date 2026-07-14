import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ILeaveRequest extends Document {
  userId: Types.ObjectId
  type: 'izin' | 'sakit' | 'cuti' | 'tugas_luar'
  startDate: Date
  endDate: Date
  reason: string
  documentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: Types.ObjectId | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['izin', 'sakit', 'cuti', 'tugas_luar'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    documentUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

LeaveRequestSchema.index({ status: 1, createdAt: -1 })
LeaveRequestSchema.index({ userId: 1, createdAt: -1 })
LeaveRequestSchema.index({ createdAt: -1 })
LeaveRequestSchema.index({ status: 1 })
LeaveRequestSchema.index({ userId: 1 })

const LeaveRequest: Model<ILeaveRequest> =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema)
export default LeaveRequest
