import { create } from 'zustand'
import type {
  UserRole,
  Carrier,
  CableSegment,
  AlertEvent,
  RiskPrediction,
  RecommendedRoute,
  SpliceScheme,
  WeeklyReport,
  ProvinceHealthSummary,
} from '@/types'
import {
  mockCableSegments,
  mockAlertEvents,
  mockRiskPredictions,
  mockRecommendedRoutes,
  mockSpliceSchemes,
  mockWeeklyReports,
  mockProvinceHealthSummaries,
} from '@/mock/data'

interface ComputedStats {
  totalCableKm: number
  avgHealthIndex: number
  monthlyFaultRate: number
  avgRepairTime: number
}

interface AppState {
  userRole: UserRole
  userProvince: string
  userCity: string
  selectedProvince: string | null
  selectedCarrier: Carrier | '全部'
  selectedTimeRange: string

  cableSegments: CableSegment[]
  alertEvents: AlertEvent[]
  riskPredictions: RiskPrediction[]
  recommendedRoutes: RecommendedRoute[]
  spliceSchemes: SpliceScheme[]
  weeklyReports: WeeklyReport[]
  provinceHealthSummaries: ProvinceHealthSummary[]

  baseRiskPredictions: RiskPrediction[]
  baseRecommendedRoutes: RecommendedRoute[]
  baseSpliceSchemes: SpliceScheme[]

  setSelectedProvince: (province: string | null) => void
  setSelectedCarrier: (carrier: Carrier | '全部') => void
  setSelectedTimeRange: (range: string) => void
  setUserRole: (role: UserRole) => void
  setUserProvince: (province: string) => void
  setUserCity: (city: string) => void

  getFilteredCableSegments: () => CableSegment[]
  getFilteredAlerts: () => AlertEvent[]
  getFilteredProvinceSummaries: () => ProvinceHealthSummary[]
  getProvinceSummary: (province: string) => ProvinceHealthSummary | undefined

  getComputedStats: () => ComputedStats

  handleAlertAction: (alertId: string, action: 'approve' | 'reject' | 'escalate', step: number) => void
  autoEscalateAlerts: () => void

  canApproveCurrentStep: (alert: AlertEvent) => boolean
  getCurrentApprovalStep: (alert: AlertEvent) => number
  getCurrentApprovalRole: (alert: AlertEvent) => string | null

  uploadInspectionPlan: (fileName: string, parsedData: string[][]) => void
  resetInspectionData: () => void
}

const computeStats = (segments: CableSegment[]): ComputedStats => {
  if (segments.length === 0) {
    return { totalCableKm: 0, avgHealthIndex: 0, monthlyFaultRate: 0, avgRepairTime: 0 }
  }
  const avgHealthIndex = Number((segments.reduce((s, c) => s + c.healthIndex, 0) / segments.length).toFixed(1))
  const unhealthyCount = segments.filter(c => c.healthIndex < 80).length
  const monthlyFaultRate = Number(((unhealthyCount / segments.length) * 2).toFixed(2))
  const totalCableKm = Math.round(segments.length * 68 + Math.random() * 200)
  const repairTimeBase = 100 - avgHealthIndex
  const avgRepairTime = Number((repairTimeBase * 0.18 + 2.5).toFixed(1))
  return { totalCableKm, avgHealthIndex, monthlyFaultRate, avgRepairTime }
}

const hashString = (str: string) => {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export const useAppStore = create<AppState>((set, get) => ({
  userRole: 'group' as UserRole,
  userProvince: '',
  userCity: '',
  selectedProvince: null,
  selectedCarrier: '全部' as Carrier | '全部',
  selectedTimeRange: '近30天',

  cableSegments: mockCableSegments,
  alertEvents: [...mockAlertEvents],
  riskPredictions: [...mockRiskPredictions],
  recommendedRoutes: [...mockRecommendedRoutes],
  spliceSchemes: [...mockSpliceSchemes],
  weeklyReports: mockWeeklyReports,
  provinceHealthSummaries: mockProvinceHealthSummaries,

  baseRiskPredictions: [...mockRiskPredictions],
  baseRecommendedRoutes: [...mockRecommendedRoutes],
  baseSpliceSchemes: [...mockSpliceSchemes],

  setSelectedProvince: (province) => set({ selectedProvince: province }),
  setSelectedCarrier: (carrier) => set({ selectedCarrier: carrier }),
  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  setUserRole: (role) => {
    if (role === 'province') {
      const provinces = mockProvinceHealthSummaries.map(s => s.province)
      set({ userRole: role, userProvince: provinces[0], userCity: '' })
    } else if (role === 'city') {
      const firstSummary = mockProvinceHealthSummaries[0]
      const firstCity = firstSummary.cityDetails[0].city
      set({ userRole: role, userProvince: firstSummary.province, userCity: firstCity })
    } else {
      set({ userRole: role, userProvince: '', userCity: '' })
    }
  },
  setUserProvince: (province) => {
    const summary = mockProvinceHealthSummaries.find(s => s.province === province)
    const city = summary && summary.cityDetails.length > 0 ? summary.cityDetails[0].city : ''
    set({ userProvince: province, userCity: city })
  },
  setUserCity: (city) => set({ userCity: city }),

  getFilteredCableSegments: () => {
    const { cableSegments, selectedProvince, selectedCarrier, userRole, userProvince, userCity } = get()
    return cableSegments.filter((seg) => {
      if (userRole === 'province' && seg.province !== userProvince) return false
      if (userRole === 'city' && seg.city !== userCity) return false
      if (selectedProvince && seg.province !== selectedProvince) return false
      if (selectedCarrier !== '全部' && seg.carrier !== selectedCarrier) return false
      return true
    })
  },

  getFilteredAlerts: () => {
    const { alertEvents, cableSegments, selectedProvince, selectedCarrier, userRole, userProvince, userCity, autoEscalateAlerts } = get()
    autoEscalateAlerts()
    const latest = get().alertEvents
    return latest.filter((alert) => {
      if (userRole === 'province' && alert.province !== userProvince) return false
      if (userRole === 'city' && alert.city !== userCity) return false
      if (selectedProvince && alert.province !== selectedProvince) return false
      if (selectedCarrier !== '全部') {
        const segment = cableSegments.find((s) => s.id === alert.cableSegmentId)
        if (segment && segment.carrier !== selectedCarrier) return false
      }
      return true
    })
  },

  getFilteredProvinceSummaries: () => {
    const { provinceHealthSummaries, selectedProvince, selectedCarrier, cableSegments, userRole, userProvince } = get()
    let summaries = [...provinceHealthSummaries]
    if (userRole === 'province' && userProvince) {
      summaries = summaries.filter(s => s.province === userProvince)
    }
    if (selectedProvince) {
      summaries = summaries.filter(s => s.province === selectedProvince)
    }
    if (selectedCarrier !== '全部') {
      const carrierSegments = cableSegments.filter(c => c.carrier === selectedCarrier)
      summaries = summaries.map(s => {
        const provinceCarrierSegments = carrierSegments.filter(c => c.province === s.province)
        const allProvinceSegments = cableSegments.filter(c => c.province === s.province)
        if (provinceCarrierSegments.length === 0) return null
        const ratio = provinceCarrierSegments.length / Math.max(allProvinceSegments.length, 1)
        return {
          ...s,
          totalCableKm: Math.round(s.totalCableKm * ratio),
          avgHealthIndex: Number((provinceCarrierSegments.reduce((a, c) => a + c.healthIndex, 0) / provinceCarrierSegments.length).toFixed(1)),
          faultRate: Number((s.faultRate * (0.8 + Math.random() * 0.4)).toFixed(2)),
        }
      }).filter((s): s is ProvinceHealthSummary => s !== null)
    }
    return summaries
  },

  getProvinceSummary: (province) => {
    const { provinceHealthSummaries } = get()
    return provinceHealthSummaries.find((s) => s.province === province)
  },

  getComputedStats: () => {
    const { getFilteredCableSegments, getFilteredProvinceSummaries, provinceHealthSummaries, selectedProvince, selectedCarrier, userRole, userProvince } = get()
    const segments = getFilteredCableSegments()
    if (segments.length === 0) return computeStats([])
    if (selectedProvince || selectedCarrier !== '全部' || userRole !== 'group') {
      return computeStats(segments)
    }
    const allSegments = get().cableSegments
    return computeStats(allSegments)
  },

  getCurrentApprovalStep: (alert) => {
    const idx = alert.approvalFlow.findIndex(s => s.status === 'pending')
    return idx === -1 ? alert.approvalFlow.length : idx
  },

  getCurrentApprovalRole: (alert) => {
    const step = get().getCurrentApprovalStep(alert)
    if (step >= alert.approvalFlow.length) return null
    return alert.approvalFlow[step].role
  },

  canApproveCurrentStep: (alert) => {
    const role = get().getCurrentApprovalRole(alert)
    if (!role) return false
    const { userRole } = get()
    if (alert.approvalFlow.length <= 1) {
      return userRole === 'province' || userRole === 'group' || userRole === 'city'
    }
    if (role === 'city') return userRole === 'city' || userRole === 'group'
    if (role === 'province') return userRole === 'province' || userRole === 'group'
    if (role === 'group') return userRole === 'group'
    return false
  },

  handleAlertAction: (alertId, action, step) => {
    set((state) => ({
      alertEvents: state.alertEvents.map((alert) => {
        if (alert.id !== alertId) return alert
        const newFlow = [...alert.approvalFlow]
        const stepIndex = newFlow.findIndex((s) => s.step === step)

        if (action === 'escalate') {
          const escalatedFlow = [
            { step: 1, role: 'city', approver: '属地运维班组长', status: 'pending' as const },
            { step: 2, role: 'province', approver: '区域经理复核', status: 'pending' as const },
            { step: 3, role: 'group', approver: '省公司网络部批准', status: 'pending' as const },
          ]
          return {
            ...alert,
            level: 2 as const,
            status: 'escalated' as const,
            approvalFlow: escalatedFlow,
          }
        }

        if (stepIndex < 0) return alert

        const currentStep = get().getCurrentApprovalStep(alert)
        const expectedStepNumber = currentStep + 1

        if (step !== expectedStepNumber) {
          return alert
        }

        if (action === 'approve') {
          newFlow[stepIndex] = {
            ...newFlow[stepIndex],
            status: 'approved' as const,
            timestamp: new Date().toLocaleString('zh-CN'),
          }
          const allApproved = newFlow.every((s) => s.status === 'approved')
          const allBefore = stepIndex === 0 || newFlow.slice(0, stepIndex).every(s => s.status === 'approved')
          if (!allBefore) return alert
          return {
            ...alert,
            approvalFlow: newFlow,
            status: allApproved ? 'approved' as const : 'processing' as const,
          }
        }

        if (action === 'reject') {
          newFlow[stepIndex] = {
            ...newFlow[stepIndex],
            status: 'rejected' as const,
            timestamp: new Date().toLocaleString('zh-CN'),
            comment: '需要补充材料后重新审批',
          }
          return { ...alert, approvalFlow: newFlow }
        }

        return alert
      }),
    }))
  },

  autoEscalateAlerts: () => {
    const now = Date.now()
    set((state) => {
      let changed = false
      const updated = state.alertEvents.map((alert) => {
        if (alert.level === 1 && alert.status === 'pending') {
          const created = new Date(alert.createdAt).getTime()
          const twoHours = 2 * 60 * 60 * 1000
          if (now - created > twoHours) {
            changed = true
            const escalatedFlow = [
              { step: 1, role: 'city', approver: '属地运维班组长', status: 'approved' as const, timestamp: new Date(created + twoHours).toLocaleString('zh-CN') },
              { step: 2, role: 'province', approver: '区域经理复核', status: 'pending' as const },
              { step: 3, role: 'group', approver: '省公司网络部批准', status: 'pending' as const },
            ]
            return {
              ...alert,
              level: 2 as const,
              status: 'escalated' as const,
              approvalFlow: escalatedFlow,
            }
          }
        }
        return alert
      })
      return changed ? { alertEvents: updated } : {}
    })
  },

  uploadInspectionPlan: (fileName, parsedData) => {
    const { cableSegments, baseRiskPredictions, baseRecommendedRoutes, baseSpliceSchemes } = get()
    const header = parsedData[0] || []
    const rows = parsedData.slice(1)

    const segNameIdx = header.findIndex(h => String(h).includes('光缆') || String(h).includes('段落') || String(h).includes('名称') || String(h).includes('段'))
    const dateIdx = header.findIndex(h => String(h).includes('日期') || String(h).includes('巡检') || String(h).includes('时间'))
    const regionIdx = header.findIndex(h => String(h).includes('地区') || String(h).includes('区域') || String(h).includes('省份') || String(h).includes('城市'))
    const riskIdx = header.findIndex(h => String(h).includes('风险') || String(h).includes('等级') || String(h).includes('级别'))

    const extractedSegments = new Set<string>()
    const extractedRegions = new Set<string>()
    rows.forEach((row) => {
      if (segNameIdx >= 0 && row[segNameIdx]) extractedSegments.add(String(row[segNameIdx]))
      if (regionIdx >= 0 && row[regionIdx]) extractedRegions.add(String(row[regionIdx]))
    })

    const fileHash = hashString(fileName + JSON.stringify(parsedData.slice(0, 10)))

    const newRisks: RiskPrediction[] = []
    const matchedCables = cableSegments.filter(c =>
      extractedSegments.size > 0
        ? Array.from(extractedSegments).some(n => c.name.includes(n.slice(0, 4)) || n.includes(c.name.slice(0, 4)))
        : true
    )
    const riskSource = matchedCables.length > 0 ? matchedCables : cableSegments.slice(0, 8)
    const factorPool = ['光功率骤降', '衰减持续上升', '振动异常', '温度偏高', '健康指数持续下降', '接头老化', '施工区域邻近', '光纤利用率过高', '外力破坏隐患', '护套老化']
    riskSource.slice(0, 6).forEach((cable, i) => {
      const rnd = (fileHash * (i + 3)) % 100
      const level: 'high' | 'medium' | 'low' = rnd > 70 ? 'high' : rnd > 40 ? 'medium' : 'low'
      const fCount = level === 'high' ? 3 : level === 'medium' ? 2 : 1
      const factors: string[] = []
      for (let f = 0; f < fCount; f++) {
        factors.push(factorPool[(rnd + f * 7) % factorPool.length])
      }
      const futureDate = new Date(Date.now() + (rnd % 60 + 15) * 86400000)
      newRisks.push({
        cableSegmentId: cable.id,
        cableSegmentName: cable.name,
        riskLevel: level,
        riskFactors: Array.from(new Set(factors)),
        predictedDate: futureDate.toISOString().slice(0, 10),
        confidence: Number((0.35 + (rnd % 60) / 100).toFixed(2)),
      })
    })
    if (newRisks.length === 0) {
      baseRiskPredictions.forEach((r, i) => {
        newRisks.push({
          ...r,
          confidence: Number(Math.min(0.95, r.confidence + ((fileHash + i * 11) % 30) / 100).toFixed(2)),
        })
      })
    }

    const newRoutes: RecommendedRoute[] = []
    const shuffled = [...cableSegments].sort((a, b) => (hashString(a.id + fileHash) - hashString(b.id + fileHash)))
    for (let r = 0; r < Math.min(4, Math.ceil(shuffled.length / 3)); r++) {
      const routeSegs = shuffled.slice(r * 3, r * 3 + 3)
      newRoutes.push({
        id: `route-${fileHash}-${r}`,
        name: extractedRegions.size > 0
          ? `${Array.from(extractedRegions)[r % extractedRegions.size]}巡检路线${r + 1}`
          : `智能推荐路线${r + 1}-${fileName.slice(0, 6)}`,
        segments: routeSegs.map(s => s.id),
        totalDistance: 120 + ((fileHash + r * 47) % 480),
        estimatedTime: `${2 + ((fileHash + r * 5) % 8)}h`,
        priorityScore: 50 + ((fileHash + r * 13) % 50),
      })
    }

    const newSchemes: SpliceScheme[] = []
    const cablePts = ['市区交界', '城郊结合', '光缆接头盒A', '主干交汇点', '机房进线', '管道转弯处']
    const materials = ['熔接盒', '尾纤', '热缩套管', '光缆接头盒', 'ODF配线架', '光纤熔接机耗材', '清洁棉片', '酒精泵']
    for (let s = 0; s < Math.min(5, newRoutes.length + 1); s++) {
      const rnd = (fileHash + s * 23) % 100
      newSchemes.push({
        id: `scheme-${fileHash}-${s}`,
        splicePoint: extractedRegions.size > 0
          ? `${Array.from(extractedRegions)[s % extractedRegions.size]}-${cablePts[(rnd + s) % cablePts.length]}`
          : `${cableSegments[s % cableSegments.length].city}-${cablePts[s % cablePts.length]}`,
        requiredMaterials: [
          `${rnd > 50 ? 48 : rnd > 25 ? 24 : 12}芯熔接盒`,
          ...materials.slice(s % 3, s % 3 + 2),
        ],
        estimatedTime: `${1 + (rnd % 5)}h-${3 + (rnd % 6)}h`,
        fiberCount: rnd > 60 ? 16 : rnd > 30 ? 12 : 8,
      })
    }

    set({
      riskPredictions: newRisks,
      recommendedRoutes: newRoutes,
      spliceSchemes: newSchemes,
    })
  },

  resetInspectionData: () => {
    const { baseRiskPredictions, baseRecommendedRoutes, baseSpliceSchemes } = get()
    set({
      riskPredictions: [...baseRiskPredictions],
      recommendedRoutes: [...baseRecommendedRoutes],
      spliceSchemes: [...baseSpliceSchemes],
    })
  },
}))
