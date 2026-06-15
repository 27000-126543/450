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
  CityDetail,
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

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

const computeStats = (segments: CableSegment[], seedStr: string): ComputedStats => {
  if (segments.length === 0) {
    return { totalCableKm: 0, avgHealthIndex: 0, monthlyFaultRate: 0, avgRepairTime: 0 }
  }
  const avgHealthIndex = Number((segments.reduce((s, c) => s + c.healthIndex, 0) / segments.length).toFixed(1))
  const unhealthyCount = segments.filter(c => c.healthIndex < 80).length
  const monthlyFaultRate = Number(((unhealthyCount / segments.length) * 2).toFixed(2))
  const rand = seededRandom(hashString(seedStr))
  const totalCableKm = Math.round(segments.length * 68 + rand() * 180 + 20)
  const repairTimeBase = 100 - avgHealthIndex
  const avgRepairTime = Number((repairTimeBase * 0.18 + 2.5 + rand() * 0.5).toFixed(1))
  return { totalCableKm, avgHealthIndex, monthlyFaultRate, avgRepairTime }
}

const riskLevelOrder = { high: 0, medium: 1, low: 2 }
const roleStepMap: Record<number, UserRole> = {
  1: 'city',
  2: 'province',
  3: 'group',
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

  canApproveStep: (alert: AlertEvent, stepIndex: number) => boolean
  getCurrentApprovalStep: (alert: AlertEvent) => number
  getCurrentApprovalRole: (alert: AlertEvent) => string | null
  getCurrentStepLabel: (alert: AlertEvent) => string | null

  uploadInspectionPlan: (fileName: string, parsedData: string[][]) => void
  resetInspectionData: () => void

  getFilteredReport: (reportIdx: number) => WeeklyReport | null
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
      const carrierSegs = cableSegments.filter(c => c.carrier === selectedCarrier)
      const seedBase = `carrier-${selectedCarrier}`
      summaries = summaries.map(s => {
        const provCarrierSegs = carrierSegs.filter(c => c.province === s.province)
        const allProvSegs = cableSegments.filter(c => c.province === s.province)
        if (provCarrierSegs.length === 0) return null
        const ratio = provCarrierSegs.length / Math.max(allProvSegs.length, 1)
        const rand = seededRandom(hashString(seedBase + s.province))
        const adjustedCityDetails: CityDetail[] = s.cityDetails.map(cd => {
          const cityCarrierSegs = provCarrierSegs.filter(cs => cs.city === cd.city)
          if (cityCarrierSegs.length === 0) return cd
          return {
            ...cd,
            healthIndex: Number((cityCarrierSegs.reduce((a, c) => a + c.healthIndex, 0) / cityCarrierSegs.length).toFixed(1)),
            cableCount: cityCarrierSegs.length,
            faultCount: Math.max(1, Math.round(cd.faultCount * ratio * (0.8 + rand() * 0.4))),
          }
        })
        return {
          ...s,
          totalCableKm: Math.round(s.totalCableKm * ratio),
          avgHealthIndex: Number((provCarrierSegs.reduce((a, c) => a + c.healthIndex, 0) / provCarrierSegs.length).toFixed(1)),
          faultRate: Number((s.faultRate * (0.85 + rand() * 0.3)).toFixed(2)),
          cityDetails: adjustedCityDetails,
        }
      }).filter((s): s is ProvinceHealthSummary => s !== null)
    }
    return summaries
  },

  getProvinceSummary: (province) => {
    const { getFilteredProvinceSummaries } = get()
    return getFilteredProvinceSummaries().find((s) => s.province === province)
  },

  getComputedStats: () => {
    const { getFilteredCableSegments, selectedProvince, selectedCarrier, userRole, userProvince, userCity } = get()
    const segments = getFilteredCableSegments()
    const seedKey = `stats-${userRole}-${userProvince}-${userCity}-${selectedProvince ?? 'all'}-${selectedCarrier}`
    return computeStats(segments, seedKey)
  },

  getCurrentApprovalStep: (alert) => {
    if (alert.level === 1) return 0
    const idx = alert.approvalFlow.findIndex(s => s.status === 'pending')
    return idx === -1 ? alert.approvalFlow.length : idx
  },

  getCurrentApprovalRole: (alert) => {
    if (alert.level === 1) return 'city'
    const step = get().getCurrentApprovalStep(alert)
    if (step >= alert.approvalFlow.length) return null
    return alert.approvalFlow[step].role
  },

  getCurrentStepLabel: (alert) => {
    if (alert.level === 1) return '班组长确认'
    const step = get().getCurrentApprovalStep(alert)
    if (step >= alert.approvalFlow.length) return null
    const labels = ['班组长确认', '区域经理复核', '省公司批准']
    return labels[step] ?? null
  },

  canApproveStep: (alert, stepIndex) => {
    if (alert.level === 1) {
      return stepIndex === 0 && get().userRole === 'city'
    }
    const flow = alert.approvalFlow
    if (stepIndex >= flow.length) return false
    const step = flow[stepIndex]
    if (step.status !== 'pending') return false
    const requiredRole = roleStepMap[step.step]
    return get().userRole === requiredRole
  },

  handleAlertAction: (alertId, action, step) => {
    set((state) => ({
      alertEvents: state.alertEvents.map((alert) => {
        if (alert.id !== alertId) return alert

        if (action === 'escalate') {
          const created = new Date(alert.createdAt).getTime()
          const twoHours = 2 * 60 * 60 * 1000
          const escalateTime = new Date(created + twoHours).toLocaleString('zh-CN')
          const escalatedFlow = [
            { step: 1, role: 'city', approver: '运维班组长', status: 'approved' as const, timestamp: escalateTime, comment: '超时未处置，自动升级' },
            { step: 2, role: 'province', approver: '区域经理', status: 'pending' as const },
            { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' as const },
          ]
          return {
            ...alert,
            level: 2 as const,
            status: 'escalated' as const,
            approvalFlow: escalatedFlow,
          }
        }

        const flowIdx = alert.approvalFlow.findIndex((s) => s.step === step)
        if (flowIdx < 0) return alert

        const currentStepIdx = get().getCurrentApprovalStep(alert)
        if (flowIdx !== currentStepIdx) return alert

        if (!get().canApproveStep(alert, flowIdx)) return alert

        const newFlow = [...alert.approvalFlow]

        if (action === 'approve') {
          const allBefore = flowIdx === 0 || newFlow.slice(0, flowIdx).every(s => s.status === 'approved')
          if (!allBefore) return alert
          newFlow[flowIdx] = {
            ...newFlow[flowIdx],
            status: 'approved' as const,
            timestamp: new Date().toLocaleString('zh-CN'),
          }
          const allApproved = newFlow.every((s) => s.status === 'approved')
          return {
            ...alert,
            approvalFlow: newFlow,
            status: allApproved ? 'approved' as const : 'processing' as const,
          }
        }

        if (action === 'reject') {
          newFlow[flowIdx] = {
            ...newFlow[flowIdx],
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
            const escalateTime = new Date(created + twoHours).toLocaleString('zh-CN')
            const escalatedFlow = [
              { step: 1, role: 'city', approver: '属地运维班组长', status: 'approved' as const, timestamp: escalateTime, comment: '超时未处置，自动升级' },
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
    const { cableSegments } = get()
    const header = parsedData[0] || []
    const rows = parsedData.slice(1)

    const headerStr = (h: unknown) => String(h ?? '')

    const isDateColumn = (h: string) => {
      if (!h) return false
      if (h.includes('人员') || h.includes('负责人') || h.includes('班组') || h.includes('工程师') || h.includes('员工')) return false
      if (h.includes('巡检日期') || h.includes('计划日期') || h.includes('检测日期') || h.includes('完成日期')) return true
      if (h.includes('日期') && !h.includes('名称') && !h.includes('类型')) return true
      return false
    }

    const dateScores = header.map((h, i) => {
      const s = headerStr(h)
      let score = 0
      if (s.includes('巡检日期')) score += 100
      else if (s.includes('计划日期')) score += 90
      else if (s.includes('日期') && !isDateColumn(s) === false) score += 80
      if (s.includes('日期')) score += 50
      if (s.includes('时间')) score += 30
      if (s.includes('巡检') && !s.includes('人员') && !s.includes('班组')) score += 20
      if (s.includes('计划') && !s.includes('人员')) score += 15
      return { idx: i, score }
    })
    dateScores.sort((a, b) => b.score - a.score)
    const dateIdx = dateScores[0]?.score > 0 ? dateScores[0].idx : -1

    const segNameIdx = header.findIndex(h => String(h).includes('光缆') || String(h).includes('段落') || String(h).includes('名称') || String(h).includes('段') || String(h).includes('线路'))
    const regionIdx = header.findIndex(h => String(h).includes('地区') || String(h).includes('区域') || String(h).includes('省份') || String(h).includes('城市') || String(h).includes('地市'))
    const riskIdx = header.findIndex(h => String(h).includes('风险') || String(h).includes('等级') || String(h).includes('级别') || String(h).includes('重要性'))
    const lenIdx = header.findIndex(h => String(h).includes('长度') || String(h).includes('公里') || String(h).includes('里程') || String(h).includes('km'))
    const teamIdx = header.findIndex(h => String(h).includes('班组') || String(h).includes('责任人') || String(h).includes('负责人'))

    const fileHash = hashString(fileName + JSON.stringify(parsedData.slice(0, 10)))
    const rand = seededRandom(fileHash)

    const parseDate = (dateStr: string): Date | null => {
      if (!dateStr) return null
      const s = String(dateStr).replace(/\./g, '-').replace(/\//g, '-').trim()
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    }

    const extractedNames: string[] = []
    const extractedRegions: string[] = []
    const extractedDates: string[] = []
    rows.forEach((row) => {
      if (segNameIdx >= 0 && row[segNameIdx]) {
        extractedNames.push(String(row[segNameIdx]).trim())
      }
      if (regionIdx >= 0 && row[regionIdx]) {
        const region = String(row[regionIdx]).trim()
        if (region && !extractedRegions.includes(region)) extractedRegions.push(region)
      }
      if (dateIdx >= 0 && row[dateIdx]) {
        const d = parseDate(String(row[dateIdx]))
        if (d) extractedDates.push(String(row[dateIdx]))
      }
    })

    const validDates = extractedDates.map(d => parseDate(d)).filter(Boolean) as Date[]
    const hasDates = validDates.length > 0
    const sortedDates = [...validDates].sort((a, b) => a.getTime() - b.getTime())

    let baseDate: Date
    if (hasDates) {
      baseDate = sortedDates[0]
    } else {
      const refDate = new Date('2026-06-01')
      const daysOffset = Math.floor(rand() * 60)
      baseDate = new Date(refDate.getTime() + daysOffset * 86400000)
    }

    const newRisks: RiskPrediction[] = []
    const displayNames = extractedNames.length > 0 ? extractedNames : extractedRegions.map(r => `${r}光缆段`)
    const numRisks = Math.min(8, Math.max(4, displayNames.length))

    const factorPool = ['光功率骤降', '衰减持续上升', '振动异常', '温度偏高', '健康指数持续下降', '接头老化', '施工区域邻近', '光纤利用率过高', '外力破坏隐患', '护套老化', '鼠害隐患', '施工扰动']

    for (let i = 0; i < numRisks; i++) {
      const name = displayNames[i % displayNames.length] + (i >= displayNames.length ? `-${i + 1}` : '')
      const rnd = Math.floor(rand() * 100)
      const level: 'high' | 'medium' | 'low' = rnd > 70 ? 'high' : rnd > 35 ? 'medium' : 'low'
      const fCount = level === 'high' ? 3 : level === 'medium' ? 2 : 1
      const factors: string[] = []
      for (let f = 0; f < fCount; f++) {
        factors.push(factorPool[Math.floor(rand() * factorPool.length)])
      }

      let predictedDateStr: string
      if (hasDates) {
        const rowDate = sortedDates[i % sortedDates.length]
        const offsetDays = level === 'high'
          ? Math.floor(rand() * 10) + 3
          : level === 'medium'
          ? Math.floor(rand() * 20) + 7
          : Math.floor(rand() * 45) + 15
        predictedDateStr = new Date(rowDate.getTime() + offsetDays * 86400000).toISOString().slice(0, 10)
      } else {
        const daysLater = 15 + Math.floor(rand() * 75)
        predictedDateStr = new Date(baseDate.getTime() + daysLater * 86400000).toISOString().slice(0, 10)
      }

      const region = extractedRegions.length > 0 ? extractedRegions[i % extractedRegions.length] : ''
      const cableId = `upload-${fileHash}-${i}`

      newRisks.push({
        cableSegmentId: cableId,
        cableSegmentName: region ? `${region}-${name}` : name,
        riskLevel: level,
        riskFactors: Array.from(new Set(factors)),
        predictedDate: predictedDateStr,
        confidence: Number((0.45 + rand() * 0.5).toFixed(2)),
      })
    }

    newRisks.sort((a, b) => riskLevelOrder[a.riskLevel] - riskLevelOrder[b.riskLevel])

    const newRoutes: RecommendedRoute[] = []
    const routeCount = Math.min(4, Math.max(2, Math.ceil(displayNames.length / 3)))
    for (let r = 0; r < routeCount; r++) {
      const routeSegs = displayNames.slice(r * 2, r * 2 + 3)
      const routeRegions = extractedRegions.length > 0
        ? extractedRegions.slice(r, r + 2).join('-')
        : `路线${r + 1}`
      newRoutes.push({
        id: `route-${fileHash}-${r}`,
        name: `${routeRegions}巡检路线${r + 1}`,
        segments: routeSegs.length > 0 ? routeSegs : [fileHash + '-' + r],
        totalDistance: 80 + Math.floor(rand() * 520),
        estimatedTime: `${2 + Math.floor(rand() * 7)}h`,
        priorityScore: 40 + Math.floor(rand() * 58),
      })
    }

    const newSchemes: SpliceScheme[] = []
    const cablePts = ['市区交界', '城郊结合', '主干交汇', '机房进线', '管道转弯', '跨河点位', '高速下穿', '开发区入口']
    const materials = ['熔接盒', '尾纤', '热缩套管', 'ODF配线架', '光纤熔接机耗材', '清洁棉片', '酒精泵', '光缆接头盒']
    const schemeCount = Math.min(6, routeCount + 2)
    for (let s = 0; s < schemeCount; s++) {
      const region = extractedRegions.length > 0 ? extractedRegions[s % extractedRegions.length] : cablePts[s % cablePts.length]
      const ptIdx = Math.floor(rand() * cablePts.length)
      const fiberCount = [12, 24, 48, 96][Math.floor(rand() * 4)]
      const matCount = 2 + Math.floor(rand() * 2)
      const selectedMats: string[] = []
      for (let m = 0; m < matCount; m++) {
        selectedMats.push(materials[Math.floor(rand() * materials.length)])
      }
      newSchemes.push({
        id: `scheme-${fileHash}-${s}`,
        splicePoint: `${region}-${cablePts[ptIdx]}`,
        requiredMaterials: [
          `${fiberCount}芯熔接盒`,
          ...Array.from(new Set(selectedMats)),
        ],
        estimatedTime: `${1 + Math.floor(rand() * 4)}h-${3 + Math.floor(rand() * 5)}h`,
        fiberCount,
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

  getFilteredReport: (reportIdx) => {
    const { weeklyReports, userRole, userProvince, userCity, getFilteredProvinceSummaries, cableSegments, getFilteredCableSegments } = get()
    const idx = reportIdx >= 0 && reportIdx < weeklyReports.length ? reportIdx : weeklyReports.length - 1
    const baseReport = weeklyReports[idx]
    if (!baseReport) return null

    if (userRole === 'group') return baseReport

    const seedStr = `report-${userRole}-${userProvince}-${userCity}-week-${idx}`
    const rand = seededRandom(hashString(seedStr))
    const filteredSegs = getFilteredCableSegments()
    const summaries = getFilteredProvinceSummaries()

    if (filteredSegs.length === 0) {
      return {
        ...baseReport,
        id: `filtered-${seedStr}`,
        faultRateYoY: 0,
        faultRateMoM: 0,
        avgRepairTime: 0,
        fiberUtilization: 0,
        repairTimeRanking: [],
        faultTypeDistribution: {},
        recommendations: ['暂无辖区数据'],
      }
    }

    const scaleFactor = filteredSegs.length / Math.max(cableSegments.length, 1)
    const yoyshift = (rand() - 0.4) * 3 + (idx - weeklyReports.length + 1) * 0.8
    const momshift = (rand() - 0.5) * 2 + (idx % 3 - 1) * 0.5

    const faultTypes = Object.keys(baseReport.faultTypeDistribution)
    const scaledFaultDist: Record<string, number> = {}
    faultTypes.forEach(t => {
      scaledFaultDist[t] = Math.max(1, Math.round(baseReport.faultTypeDistribution[t] * scaleFactor * (0.8 + rand() * 0.4)))
    })

    let filteredRanking: { province: string; avgHours: number }[] = []
    if (userRole === 'city' && userCity) {
      const cityDistricts = ['中心城区', '东部新区', '南部片区', '西部产业带', '北部开发区', '高新区', '经开区', '保税区']
      const districtCount = Math.min(6, Math.max(3, Math.ceil(filteredSegs.length / 3)))
      for (let i = 0; i < districtCount; i++) {
        filteredRanking.push({
          province: cityDistricts[i % cityDistricts.length],
          avgHours: 1.5 + rand() * 6,
        })
      }
      filteredRanking.sort((a, b) => a.avgHours - b.avgHours)
    } else {
      filteredRanking = summaries
        .map(s => ({ province: s.province, avgHours: s.avgRepairTime + rand() * 1.5 - 0.75 }))
        .sort((a, b) => a.avgHours - b.avgHours)
        .slice(0, 10)
    }

    const regionLabel = userRole === 'city' && userCity ? userCity : userProvince || ''
    const regionRecommendations = userRole === 'city'
      ? [
          `${userCity}辖区内高风险段落巡检频次建议提升至每周一次`,
          `建议加强${userCity}区域备纤资源储备，重点覆盖核心接入环`,
          `${userCity}班组故障处理响应时间仍有优化空间，建议增加应急备勤`,
          `${userCity}城区管道光缆老化比例偏高，建议分批次更新改造`,
          `建议在${userCity}重点路段引入光缆振动监测传感器`,
          `${userCity}核心机房ODF架跳纤规范需加强，降低人为故障率`,
        ]
      : [
          `${regionLabel}辖区内高风险段巡检频次建议提升至每两周一次`,
          `建议加强${regionLabel}区域备纤资源储备`,
          `辖区内光缆健康指数区域差异较大，建议重点关注故障多发段落`,
          `${regionLabel}班组人员配置建议补充1-2人`,
          '建议引入光缆振动监测传感器补充预警能力',
          '重点段落的接头盒定期检测频率建议从半年缩短为季度',
        ]

    const baseRecomms = baseReport.recommendations
    const finalRecomms = [...regionRecommendations, ...baseRecomms.slice(0, 1)].slice(0, 5)

    return {
      ...baseReport,
      id: `filtered-${seedStr}`,
      faultRateYoY: Number((baseReport.faultRateYoY + yoyshift).toFixed(1)),
      faultRateMoM: Number((baseReport.faultRateMoM + momshift).toFixed(1)),
      avgRepairTime: Number((baseReport.avgRepairTime * (0.9 + rand() * 0.2) + (idx % 2) * 0.3).toFixed(1)),
      fiberUtilization: Math.max(40, Math.round(baseReport.fiberUtilization * (0.85 + rand() * 0.3))),
      repairTimeRanking: filteredRanking.map(r => ({ ...r, avgHours: Number(r.avgHours.toFixed(1)) })),
      faultTypeDistribution: scaledFaultDist,
      recommendations: finalRecomms,
    }
  },
}))
