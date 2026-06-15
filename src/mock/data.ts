import type {
  CableSegment,
  AlertEvent,
  RiskPrediction,
  RecommendedRoute,
  SpliceScheme,
  WeeklyReport,
  ProvinceHealthSummary,
} from '@/types'

export const mockCableSegments: CableSegment[] = [
  { id: 'cs-001', name: '京沪主干线-北京段', province: '北京', city: '北京', carrier: '移动', cableType: '骨干', healthIndex: 92, opticalPower: -3.2, attenuation: 0.22, temperature: 26.5, vibrationLevel: 0.3, teamId: 't-001', teamName: '北京维护一组', lastInspection: '2026-06-10', fiberUtilization: 0.78 },
  { id: 'cs-002', name: '京沪主干线-上海段', province: '上海', city: '上海', carrier: '移动', cableType: '骨干', healthIndex: 88, opticalPower: -4.1, attenuation: 0.28, temperature: 28.1, vibrationLevel: 0.5, teamId: 't-002', teamName: '上海维护二组', lastInspection: '2026-06-09', fiberUtilization: 0.82 },
  { id: 'cs-003', name: '广深城际光缆-广州段', province: '广东', city: '广州', carrier: '电信', cableType: '骨干', healthIndex: 95, opticalPower: -2.8, attenuation: 0.18, temperature: 30.2, vibrationLevel: 0.2, teamId: 't-003', teamName: '广州维护一组', lastInspection: '2026-06-12', fiberUtilization: 0.71 },
  { id: 'cs-004', name: '广深城际光缆-深圳段', province: '广东', city: '深圳', carrier: '电信', cableType: '骨干', healthIndex: 78, opticalPower: -6.5, attenuation: 0.45, temperature: 31.0, vibrationLevel: 1.2, teamId: 't-004', teamName: '深圳维护一组', lastInspection: '2026-06-08', fiberUtilization: 0.89 },
  { id: 'cs-005', name: '宁杭光缆-南京段', province: '江苏', city: '南京', carrier: '联通', cableType: '骨干', healthIndex: 85, opticalPower: -3.9, attenuation: 0.31, temperature: 27.3, vibrationLevel: 0.4, teamId: 't-005', teamName: '南京维护一组', lastInspection: '2026-06-11', fiberUtilization: 0.76 },
  { id: 'cs-006', name: '杭甬光缆-杭州段', province: '浙江', city: '杭州', carrier: '联通', cableType: '汇聚', healthIndex: 91, opticalPower: -3.0, attenuation: 0.20, temperature: 27.8, vibrationLevel: 0.2, teamId: 't-006', teamName: '杭州维护一组', lastInspection: '2026-06-12', fiberUtilization: 0.68 },
  { id: 'cs-007', name: '成渝光缆-成都段', province: '四川', city: '成都', carrier: '移动', cableType: '骨干', healthIndex: 82, opticalPower: -4.5, attenuation: 0.35, temperature: 25.6, vibrationLevel: 0.6, teamId: 't-007', teamName: '成都维护一组', lastInspection: '2026-06-10', fiberUtilization: 0.74 },
  { id: 'cs-008', name: '成渝光缆-重庆段', province: '四川', city: '重庆', carrier: '移动', cableType: '骨干', healthIndex: 76, opticalPower: -7.2, attenuation: 0.52, temperature: 29.4, vibrationLevel: 1.5, teamId: 't-008', teamName: '重庆维护一组', lastInspection: '2026-06-07', fiberUtilization: 0.91 },
  { id: 'cs-009', name: '武汉城域光缆-东湖段', province: '湖北', city: '武汉', carrier: '电信', cableType: '汇聚', healthIndex: 94, opticalPower: -2.5, attenuation: 0.19, temperature: 28.9, vibrationLevel: 0.1, teamId: 't-009', teamName: '武汉维护一组', lastInspection: '2026-06-13', fiberUtilization: 0.65 },
  { id: 'cs-010', name: '济南城域光缆-历城段', province: '山东', city: '济南', carrier: '电信', cableType: '汇聚', healthIndex: 87, opticalPower: -3.6, attenuation: 0.26, temperature: 27.1, vibrationLevel: 0.3, teamId: 't-010', teamName: '济南维护一组', lastInspection: '2026-06-11', fiberUtilization: 0.72 },
  { id: 'cs-011', name: '郑州城域光缆-金水段', province: '河南', city: '郑州', carrier: '联通', cableType: '汇聚', healthIndex: 90, opticalPower: -3.1, attenuation: 0.21, temperature: 28.3, vibrationLevel: 0.2, teamId: 't-011', teamName: '郑州维护一组', lastInspection: '2026-06-12', fiberUtilization: 0.69 },
  { id: 'cs-012', name: '福州城域光缆-鼓楼段', province: '福建', city: '福州', carrier: '移动', cableType: '汇聚', healthIndex: 93, opticalPower: -2.9, attenuation: 0.20, temperature: 29.5, vibrationLevel: 0.1, teamId: 't-012', teamName: '福州维护一组', lastInspection: '2026-06-13', fiberUtilization: 0.63 },
  { id: 'cs-013', name: '上海浦东光缆-陆家嘴段', province: '上海', city: '上海', carrier: '电信', cableType: '接入', healthIndex: 96, opticalPower: -2.1, attenuation: 0.15, temperature: 27.0, vibrationLevel: 0.1, teamId: 't-013', teamName: '上海维护三组', lastInspection: '2026-06-14', fiberUtilization: 0.58 },
  { id: 'cs-014', name: '北京昌平光缆-回龙观段', province: '北京', city: '北京', carrier: '联通', cableType: '接入', healthIndex: 71, opticalPower: -8.3, attenuation: 0.68, temperature: 26.8, vibrationLevel: 2.1, teamId: 't-014', teamName: '北京维护三组', lastInspection: '2026-06-06', fiberUtilization: 0.95 },
  { id: 'cs-015', name: '广州天河光缆-珠江新城段', province: '广东', city: '广州', carrier: '移动', cableType: '接入', healthIndex: 89, opticalPower: -3.4, attenuation: 0.24, temperature: 30.8, vibrationLevel: 0.3, teamId: 't-015', teamName: '广州维护二组', lastInspection: '2026-06-11', fiberUtilization: 0.73 },
]

export const mockAlertEvents: AlertEvent[] = [
  {
    id: 'alert-001', level: 1, cableSegmentId: 'cs-004', cableSegmentName: '广深城际光缆-深圳段', province: '广东', city: '深圳',
    triggerReason: '光功率骤降', triggerData: [{ timestamp: '2026-06-14 08:25:00', value: -8.2 }, { timestamp: '2026-06-14 08:26:00', value: -9.1 }, { timestamp: '2026-06-14 08:27:00', value: -12.5 }],
    status: 'pending', createdAt: '2026-06-14 08:30:00', deadline: '2026-06-14 20:30:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'pending' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-002', level: 1, cableSegmentId: 'cs-008', cableSegmentName: '成渝光缆-重庆段', province: '四川', city: '重庆',
    triggerReason: '健康指数持续下降', triggerData: [{ timestamp: '2026-06-10 00:00:00', value: 82 }, { timestamp: '2026-06-11 00:00:00', value: 79 }, { timestamp: '2026-06-12 00:00:00', value: 76 }],
    status: 'processing', createdAt: '2026-06-13 14:20:00', deadline: '2026-06-14 14:20:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'approved', timestamp: '2026-06-13 15:00:00' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-003', level: 2, cableSegmentId: 'cs-014', cableSegmentName: '北京昌平光缆-回龙观段', province: '北京', city: '北京',
    triggerReason: '频繁故障告警', triggerData: [{ timestamp: '2026-06-08 10:00:00', value: 1 }, { timestamp: '2026-06-10 14:00:00', value: 1 }, { timestamp: '2026-06-12 09:00:00', value: 1 }, { timestamp: '2026-06-13 11:00:00', value: 1 }, { timestamp: '2026-06-14 08:00:00', value: 1 }],
    status: 'escalated', createdAt: '2026-06-14 10:15:00', deadline: '2026-06-15 10:15:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'approved', timestamp: '2026-06-14 10:30:00', comment: '超时未处置，自动升级' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-004', level: 1, cableSegmentId: 'cs-005', cableSegmentName: '宁杭光缆-南京段', province: '江苏', city: '南京',
    triggerReason: '光衰减超标', triggerData: [{ timestamp: '2026-06-12 08:00:00', value: 0.35 }, { timestamp: '2026-06-12 09:00:00', value: 0.38 }, { timestamp: '2026-06-12 10:00:00', value: 0.42 }],
    status: 'pending', createdAt: '2026-06-12 09:45:00', deadline: '2026-06-13 09:45:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'pending' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-005', level: 1, cableSegmentId: 'cs-007', cableSegmentName: '成渝光缆-成都段', province: '四川', city: '成都',
    triggerReason: '护套破损检测', triggerData: [{ timestamp: '2026-06-11 15:30:00', value: 1 }],
    status: 'processing', createdAt: '2026-06-11 16:00:00', deadline: '2026-06-12 16:00:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'approved', timestamp: '2026-06-11 17:00:00' }, { step: 2, role: 'province', approver: '区域经理', status: 'approved', timestamp: '2026-06-12 09:00:00' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-006', level: 1, cableSegmentId: 'cs-002', cableSegmentName: '京沪主干线-上海段', province: '上海', city: '上海',
    triggerReason: '施工影响预警', triggerData: [{ timestamp: '2026-06-14 06:50:00', value: 1.8 }],
    status: 'pending', createdAt: '2026-06-14 07:00:00', deadline: '2026-06-14 19:00:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'pending' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-007', level: 1, cableSegmentId: 'cs-010', cableSegmentName: '济南城域光缆-历城段', province: '山东', city: '济南',
    triggerReason: '接头损耗异常', triggerData: [{ timestamp: '2026-06-13 11:00:00', value: 0.52 }, { timestamp: '2026-06-13 11:15:00', value: 0.58 }],
    status: 'processing', createdAt: '2026-06-13 11:30:00', deadline: '2026-06-14 11:30:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'approved', timestamp: '2026-06-13 12:00:00' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
  {
    id: 'alert-008', level: 2, cableSegmentId: 'cs-009', cableSegmentName: '武汉城域光缆-东湖段', province: '湖北', city: '武汉',
    triggerReason: '路由偏移检测', triggerData: [{ timestamp: '2026-06-14 12:50:00', value: 2.3 }],
    status: 'escalated', createdAt: '2026-06-14 13:00:00', deadline: '2026-06-15 01:00:00',
    approvalFlow: [{ step: 1, role: 'city', approver: '运维班组长', status: 'approved', timestamp: '2026-06-14 13:10:00', comment: '超时未处置，自动升级' }, { step: 2, role: 'province', approver: '区域经理', status: 'pending' }, { step: 3, role: 'group', approver: '省公司网络部', status: 'pending' }],
  },
]

export const mockRiskPredictions: RiskPrediction[] = [
  { cableSegmentId: 'cs-004', cableSegmentName: '广深城际光缆-深圳段', riskLevel: 'high', riskFactors: ['光功率骤降', '衰减持续上升', '振动异常'], predictedDate: '2026-06-15', confidence: 0.78 },
  { cableSegmentId: 'cs-008', cableSegmentName: '成渝光缆-重庆段', riskLevel: 'high', riskFactors: ['健康指数持续下降', '温度偏高', '光纤利用率过高'], predictedDate: '2026-06-15', confidence: 0.72 },
  { cableSegmentId: 'cs-014', cableSegmentName: '北京昌平光缆-回龙观段', riskLevel: 'high', riskFactors: ['频繁故障', '衰减严重', '振动异常'], predictedDate: '2026-06-15', confidence: 0.85 },
  { cableSegmentId: 'cs-005', cableSegmentName: '宁杭光缆-南京段', riskLevel: 'medium', riskFactors: ['光衰减上升趋势', '接头老化'], predictedDate: '2026-06-16', confidence: 0.45 },
  { cableSegmentId: 'cs-002', cableSegmentName: '京沪主干线-上海段', riskLevel: 'medium', riskFactors: ['施工区域邻近', '振动水平上升'], predictedDate: '2026-06-16', confidence: 0.52 },
  { cableSegmentId: 'cs-010', cableSegmentName: '济南城域光缆-历城段', riskLevel: 'low', riskFactors: ['接头损耗增大'], predictedDate: '2026-06-18', confidence: 0.25 },
]

export const mockRecommendedRoutes: RecommendedRoute[] = [
  { id: 'rr-001', name: '京沪备用路由-北线', segments: ['cs-001', 'cs-010', 'cs-011'], totalDistance: 450, estimatedTime: '6h', priorityScore: 82 },
  { id: 'rr-002', name: '广深备用路由-东线', segments: ['cs-003', 'cs-015'], totalDistance: 180, estimatedTime: '3h', priorityScore: 75 },
  { id: 'rr-003', name: '成渝备用路由-南线', segments: ['cs-007'], totalDistance: 350, estimatedTime: '5h', priorityScore: 68 },
  { id: 'rr-004', name: '宁杭备用路由-西线', segments: ['cs-005', 'cs-006'], totalDistance: 280, estimatedTime: '4h', priorityScore: 79 },
]

export const mockSpliceSchemes: SpliceScheme[] = [
  { id: 'ss-001', splicePoint: '深圳-东莞交界处', requiredMaterials: ['24芯熔接盒', '尾纤', '热缩套管'], estimatedTime: '4h', fiberCount: 12 },
  { id: 'ss-002', splicePoint: '重庆-内江交界处', requiredMaterials: ['48芯熔接盒', '尾纤', '热缩套管', '光缆接头盒'], estimatedTime: '6h', fiberCount: 8 },
  { id: 'ss-003', splicePoint: '北京昌平回龙观', requiredMaterials: ['96芯熔接盒', '尾纤', '热缩套管', 'ODF配线架'], estimatedTime: '8h', fiberCount: 16 },
  { id: 'ss-004', splicePoint: '南京-马鞍山交界处', requiredMaterials: ['12芯熔接盒', '尾纤', '热缩套管'], estimatedTime: '2h', fiberCount: 6 },
]

export const mockWeeklyReports: WeeklyReport[] = [
  {
    id: 'wr-001', weekStart: '2026-05-18', weekEnd: '2026-05-24',
    faultRateYoY: 12.5, faultRateMoM: -3.2, avgRepairTime: 6.5,
    repairTimeRanking: [{ province: '北京', avgHours: 12 }, { province: '四川', avgHours: 8.5 }, { province: '广东', avgHours: 6.5 }, { province: '江苏', avgHours: 5 }],
    fiberUtilization: 0.76, faultTypeDistribution: { '光缆断裂': 2, '接头故障': 3, '外力破坏': 1 },
    recommendations: ['深圳段紧急修复方案已启动', '加强重庆段巡检频次', '省公司网络部需重点督办高风险段落'],
  },
  {
    id: 'wr-002', weekStart: '2026-05-25', weekEnd: '2026-05-31',
    faultRateYoY: -5.1, faultRateMoM: 8.3, avgRepairTime: 8.5,
    repairTimeRanking: [{ province: '北京', avgHours: 12 }, { province: '四川', avgHours: 8.5 }, { province: '山东', avgHours: 4 }],
    fiberUtilization: 0.82, faultTypeDistribution: { '光缆断裂': 1, '接头故障': 2, '护套破损': 3 },
    recommendations: ['重庆段健康指数持续偏低需重点关注', '成都段护套破损待省公司审批', '区域经理复核进度需加快'],
  },
  {
    id: 'wr-003', weekStart: '2026-06-01', weekEnd: '2026-06-07',
    faultRateYoY: 25.0, faultRateMoM: 15.6, avgRepairTime: 12,
    repairTimeRanking: [{ province: '北京', avgHours: 12 }, { province: '上海', avgHours: 6 }, { province: '山东', avgHours: 4 }],
    fiberUtilization: 0.89, faultTypeDistribution: { '光缆断裂': 1, '接头故障': 4, '外力破坏': 2 },
    recommendations: ['昌平回龙观段已升级为二级告警', '建议启动更换方案', '省公司网络部批准后方可执行割接'],
  },
  {
    id: 'wr-004', weekStart: '2026-06-08', weekEnd: '2026-06-14',
    faultRateYoY: -8.2, faultRateMoM: -1.5, avgRepairTime: 5,
    repairTimeRanking: [{ province: '江苏', avgHours: 5 }, { province: '浙江', avgHours: 3 }, { province: '福建', avgHours: 0 }],
    fiberUtilization: 0.71, faultTypeDistribution: { '接头故障': 2, '衰减异常': 1 },
    recommendations: ['南京段衰减问题已定位', '计划本周完成接头更换', '运维班组长需加强日常巡检'],
  },
]

export const mockProvinceHealthSummaries: ProvinceHealthSummary[] = [
  {
    province: '北京', avgHealthIndex: 81.5, totalCableKm: 365, faultRate: 1.64, avgRepairTime: 8,
    cityDetails: [{ city: '北京', healthIndex: 81.5, cableCount: 2, faultCount: 6, powerTrend: [{ date: '2026-06-08', value: -4.2 }, { date: '2026-06-10', value: -5.1 }, { date: '2026-06-12', value: -6.3 }, { date: '2026-06-14', value: -5.8 }], faultTypeDistribution: { '接头故障': 3, '外力破坏': 2, '光缆断裂': 1 } }],
  },
  {
    province: '上海', avgHealthIndex: 92, totalCableKm: 340, faultRate: 0.59, avgRepairTime: 3,
    cityDetails: [{ city: '上海', healthIndex: 92, cableCount: 2, faultCount: 2, powerTrend: [{ date: '2026-06-08', value: -3.5 }, { date: '2026-06-10', value: -3.8 }, { date: '2026-06-12', value: -3.6 }, { date: '2026-06-14', value: -4.0 }], faultTypeDistribution: { '施工影响': 1, '接头故障': 1 } }],
  },
  {
    province: '广东', avgHealthIndex: 86.5, totalCableKm: 325, faultRate: 0.92, avgRepairTime: 4,
    cityDetails: [
      { city: '广州', healthIndex: 92, cableCount: 2, faultCount: 1, powerTrend: [{ date: '2026-06-08', value: -2.9 }, { date: '2026-06-10', value: -2.8 }, { date: '2026-06-12', value: -2.7 }, { date: '2026-06-14', value: -2.8 }], faultTypeDistribution: { '接头故障': 1 } },
      { city: '深圳', healthIndex: 78, cableCount: 1, faultCount: 3, powerTrend: [{ date: '2026-06-08', value: -6.5 }, { date: '2026-06-10', value: -7.2 }, { date: '2026-06-12', value: -8.1 }, { date: '2026-06-14', value: -9.5 }], faultTypeDistribution: { '光缆断裂': 2, '衰减异常': 1 } },
    ],
  },
  {
    province: '江苏', avgHealthIndex: 85, totalCableKm: 200, faultRate: 1.0, avgRepairTime: 5,
    cityDetails: [{ city: '南京', healthIndex: 85, cableCount: 1, faultCount: 2, powerTrend: [{ date: '2026-06-08', value: -3.6 }, { date: '2026-06-10', value: -3.9 }, { date: '2026-06-12', value: -4.2 }, { date: '2026-06-14', value: -3.9 }], faultTypeDistribution: { '衰减异常': 1, '接头故障': 1 } }],
  },
  {
    province: '浙江', avgHealthIndex: 91, totalCableKm: 180, faultRate: 0.56, avgRepairTime: 3,
    cityDetails: [{ city: '杭州', healthIndex: 91, cableCount: 1, faultCount: 1, powerTrend: [{ date: '2026-06-08', value: -3.0 }, { date: '2026-06-10', value: -2.9 }, { date: '2026-06-12', value: -3.1 }, { date: '2026-06-14', value: -3.0 }], faultTypeDistribution: { '接头故障': 1 } }],
  },
  {
    province: '四川', avgHealthIndex: 79, totalCableKm: 500, faultRate: 1.2, avgRepairTime: 8.5,
    cityDetails: [
      { city: '成都', healthIndex: 82, cableCount: 1, faultCount: 2, powerTrend: [{ date: '2026-06-08', value: -4.5 }, { date: '2026-06-10', value: -4.3 }, { date: '2026-06-12', value: -4.6 }, { date: '2026-06-14', value: -4.5 }], faultTypeDistribution: { '护套破损': 1, '衰减异常': 1 } },
      { city: '重庆', healthIndex: 76, cableCount: 1, faultCount: 4, powerTrend: [{ date: '2026-06-08', value: -7.2 }, { date: '2026-06-10', value: -7.5 }, { date: '2026-06-12', value: -7.8 }, { date: '2026-06-14', value: -7.2 }], faultTypeDistribution: { '光缆断裂': 2, '外力破坏': 2 } },
    ],
  },
  {
    province: '湖北', avgHealthIndex: 94, totalCableKm: 90, faultRate: 0, avgRepairTime: 0,
    cityDetails: [{ city: '武汉', healthIndex: 94, cableCount: 1, faultCount: 0, powerTrend: [{ date: '2026-06-08', value: -2.5 }, { date: '2026-06-10', value: -2.4 }, { date: '2026-06-12', value: -2.5 }, { date: '2026-06-14', value: -2.5 }], faultTypeDistribution: {} }],
  },
  {
    province: '山东', avgHealthIndex: 87, totalCableKm: 110, faultRate: 0.91, avgRepairTime: 4,
    cityDetails: [{ city: '济南', healthIndex: 87, cableCount: 1, faultCount: 1, powerTrend: [{ date: '2026-06-08', value: -3.5 }, { date: '2026-06-10', value: -3.6 }, { date: '2026-06-12', value: -3.8 }, { date: '2026-06-14', value: -3.6 }], faultTypeDistribution: { '接头故障': 1 } }],
  },
  {
    province: '河南', avgHealthIndex: 90, totalCableKm: 85, faultRate: 1.18, avgRepairTime: 3,
    cityDetails: [{ city: '郑州', healthIndex: 90, cableCount: 1, faultCount: 1, powerTrend: [{ date: '2026-06-08', value: -3.1 }, { date: '2026-06-10', value: -3.0 }, { date: '2026-06-12', value: -3.2 }, { date: '2026-06-14', value: -3.1 }], faultTypeDistribution: { '接头故障': 1 } }],
  },
  {
    province: '福建', avgHealthIndex: 93, totalCableKm: 75, faultRate: 0, avgRepairTime: 0,
    cityDetails: [{ city: '福州', healthIndex: 93, cableCount: 1, faultCount: 0, powerTrend: [{ date: '2026-06-08', value: -2.9 }, { date: '2026-06-10', value: -2.8 }, { date: '2026-06-12', value: -2.9 }, { date: '2026-06-14', value: -2.9 }], faultTypeDistribution: {} }],
  },
]
