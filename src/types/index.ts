export interface CableSegment {
  id: string
  name: string
  province: string
  city: string
  carrier: '移动' | '联通' | '电信'
  cableType: '骨干' | '汇聚' | '接入'
  healthIndex: number
  opticalPower: number
  attenuation: number
  temperature: number
  vibrationLevel: number
  teamId: string
  teamName: string
  lastInspection: string
  fiberUtilization: number
}

export interface AlertEvent {
  id: string
  level: 1 | 2
  cableSegmentId: string
  cableSegmentName: string
  province: string
  city: string
  triggerReason: string
  triggerData: { timestamp: string; value: number }[]
  status: 'pending' | 'processing' | 'escalated' | 'approved' | 'closed'
  createdAt: string
  deadline: string
  approvalFlow: ApprovalStep[]
}

export interface ApprovalStep {
  step: number
  role: string
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  timestamp?: string
  comment?: string
}

export interface RiskPrediction {
  cableSegmentId: string
  cableSegmentName: string
  riskLevel: 'high' | 'medium' | 'low'
  riskFactors: string[]
  predictedDate: string
  confidence: number
}

export interface RecommendedRoute {
  id: string
  name: string
  segments: string[]
  totalDistance: number
  estimatedTime: string
  priorityScore: number
}

export interface SpliceScheme {
  id: string
  splicePoint: string
  requiredMaterials: string[]
  estimatedTime: string
  fiberCount: number
}

export interface WeeklyReport {
  id: string
  weekStart: string
  weekEnd: string
  faultRateYoY: number
  faultRateMoM: number
  avgRepairTime: number
  repairTimeRanking: { province: string; avgHours: number }[]
  fiberUtilization: number
  faultTypeDistribution: Record<string, number>
  recommendations: string[]
}

export interface ProvinceHealthSummary {
  province: string
  avgHealthIndex: number
  totalCableKm: number
  faultRate: number
  avgRepairTime: number
  cityDetails: CityDetail[]
}

export interface CityDetail {
  city: string
  healthIndex: number
  cableCount: number
  faultCount: number
  powerTrend: { date: string; value: number }[]
  faultTypeDistribution: Record<string, number>
}

export type UserRole = 'group' | 'province' | 'city'
export type Carrier = '移动' | '联通' | '电信'
