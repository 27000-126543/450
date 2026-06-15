import { useState } from 'react'
import { Download, FileText, Lightbulb, ChevronDown } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '@/store/useAppStore'

const priorityColors: Record<number, string> = { 0: 'border-cyan', 1: 'border-warning', 2: 'border-success' }
const priorityBadge: Record<number, string> = { 0: 'badge-cyan', 1: 'badge-orange', 2: 'badge-green' }
const priorityLabel: Record<number, string> = { 0: '高', 1: '中', 2: '低' }

const yoyColor = (v: number) => v <= 0 ? 'text-success' : 'text-danger'

export default function Reports() {
  const { weeklyReports, getFilteredReport, userRole, userProvince, userCity } = useAppStore()
  const [selectedIdx, setSelectedIdx] = useState(weeklyReports.length - 1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const report = getFilteredReport(selectedIdx)
  const baseReport = weeklyReports[selectedIdx] ?? weeklyReports[weeklyReports.length - 1]
  const displayReport = report ?? baseReport

  const faultTypes = Object.keys(displayReport.faultTypeDistribution)
  const currentValues = Object.values(displayReport.faultTypeDistribution)
  const prevFiltered = selectedIdx > 0 ? getFilteredReport(selectedIdx - 1) : null
  const prevValues = prevFiltered
    ? faultTypes.map((k) => prevFiltered.faultTypeDistribution[k] ?? 0)
    : currentValues.map(() => 0)
  const totalFaults = currentValues.reduce((a, b) => a + b, 0)

  const ranking = [...displayReport.repairTimeRanking].sort((a, b) => a.avgHours - b.avgHours)
  const maxHours = Math.max(...ranking.map((r) => r.avgHours), 1)

  const scopeLabel = userRole === 'group' ? '全国' : userRole === 'province' ? `${userProvince}省` : `${userCity}市`

  const getHistoryRow = (idx: number) => {
    return getFilteredReport(idx) ?? weeklyReports[idx]
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">运维诊断报告</h1>
          <p className="text-sm text-text-muted">每周自动生成 · 当前范围：<span className="text-cyan">{scopeLabel}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="btn-secondary flex items-center gap-2" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <FileText size={16} />
              {displayReport.weekStart} ~ {displayReport.weekEnd}
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[240px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {weeklyReports.map((r, i) => {
                  const row = getHistoryRow(i)
                  return (
                    <button key={r.id} className={`w-full px-4 py-2 text-left text-sm hover:bg-card-hover ${i === selectedIdx ? 'text-cyan' : 'text-text-secondary'}`}
                      onClick={() => { setSelectedIdx(i); setDropdownOpen(false) }}>
                      {row.weekStart} ~ {row.weekEnd}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Download size={16} />导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">故障率同比</p>
          <p className={`stat-value font-din ${yoyColor(displayReport.faultRateYoY)}`}>{displayReport.faultRateYoY > 0 ? '+' : ''}{displayReport.faultRateYoY}%</p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">故障率环比</p>
          <p className={`stat-value font-din ${yoyColor(displayReport.faultRateMoM)}`}>{displayReport.faultRateMoM > 0 ? '+' : ''}{displayReport.faultRateMoM}%</p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">平均修复时长</p>
          <p className="stat-value font-din text-text-primary">{displayReport.avgRepairTime}<span className="text-sm text-text-muted ml-1">小时</span></p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">纤芯利用率</p>
          <p className="stat-value font-din text-text-primary">{displayReport.fiberUtilization}%</p>
          <div className="health-bar mt-2"><div className="health-bar-fill" style={{ width: `${displayReport.fiberUtilization}%`, background: 'linear-gradient(90deg, #00D4FF, #00E676)' }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">故障类型对比</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'axis', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE', fontSize: 12 } },
            legend: { data: ['本周', '上周'], textStyle: { color: '#8BA3C7' } },
            grid: { top: 40, right: 20, bottom: 30, left: 50 },
            xAxis: { type: 'category', data: faultTypes, axisLabel: { color: '#8BA3C7' }, axisLine: { lineStyle: { color: '#1E3A5F' } } },
            yAxis: { type: 'value', axisLabel: { color: '#8BA3C7' }, splitLine: { lineStyle: { color: '#1E3A5F22' } } },
            series: [
              { name: '本周', type: 'bar', data: currentValues, itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] }, barWidth: 28 },
              { name: '上周', type: 'bar', data: prevValues, itemStyle: { color: '#475569', borderRadius: [4, 4, 0, 0] }, barWidth: 28 },
            ],
          }} style={{ height: 260 }} />
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">修复时长排名</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'axis', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE', fontSize: 12 }, formatter: '{b}: {c}小时' },
            grid: { left: 60, right: 30, top: 10, bottom: 20 },
            xAxis: { type: 'value', name: '小时', axisLabel: { color: '#8BA3C7' }, splitLine: { lineStyle: { color: '#1E3A5F22' } } },
            yAxis: { type: 'category', data: ranking.map((r) => r.province), axisLabel: { color: '#8BA3C7' } },
            series: [{
              type: 'bar',
              data: ranking.map((r) => ({
                value: r.avgHours,
                itemStyle: {
                  color: {
                    type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                    colorStops: [
                      { offset: 0, color: '#00E676' },
                      { offset: r.avgHours / maxHours * 0.5, color: '#FF9100' },
                      { offset: 1, color: '#FF1744' },
                    ],
                  },
                  borderRadius: [0, 4, 4, 0],
                },
              })),
              barWidth: 14,
            }],
          }} style={{ height: 260 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">故障类型分布</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'item', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE' } },
            color: ['#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#0ea5e9'],
            series: [{
              type: 'pie', radius: ['45%', '70%'],
              label: { color: '#8BA3C7', fontSize: 11 },
              labelLine: { lineStyle: { color: '#5A7A9E' } },
              data: faultTypes.map((k, i) => ({ name: k, value: currentValues[i] })),
              emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
            }],
            graphic: [{
              type: 'text', left: 'center', top: 'middle',
              style: { text: `${totalFaults}`, fontSize: 28, fontWeight: 'bold', fill: '#E8F0FE', textAlign: 'center' },
            }, {
              type: 'text', left: 'center', top: '57%',
              style: { text: '总故障数', fontSize: 11, fill: '#8BA3C7', textAlign: 'center' },
            }],
          }} style={{ height: 280 }} />
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">策略优化建议</h3>
          <div className="space-y-3">
            {displayReport.recommendations.map((rec, i) => (
              <div key={i} className={`rounded-lg border-l-4 ${priorityColors[i % 3]} bg-card-hover p-3`}>
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-cyan mt-0.5 shrink-0" />
                  <span className="text-sm text-text-primary">{rec}</span>
                </div>
                <span className={`badge ${priorityBadge[i % 3]} mt-2 inline-block`}>{priorityLabel[i % 3]}优先</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">历史报告</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2 text-left">报告周期</th>
                <th className="py-2 text-left">故障率同比</th>
                <th className="py-2 text-left">故障率环比</th>
                <th className="py-2 text-left">平均修复时长</th>
                <th className="py-2 text-left">纤芯利用率</th>
                <th className="py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {weeklyReports.map((r, i) => {
                const row = getHistoryRow(i)
                return (
                  <tr key={r.id} className={`border-b border-border/50 ${i === selectedIdx ? 'bg-cyan/5' : ''}`}>
                    <td className="py-2 text-text-secondary">{row.weekStart} ~ {row.weekEnd}</td>
                    <td className={`py-2 font-din ${yoyColor(row.faultRateYoY)}`}>{row.faultRateYoY > 0 ? '+' : ''}{row.faultRateYoY}%</td>
                    <td className={`py-2 font-din ${yoyColor(row.faultRateMoM)}`}>{row.faultRateMoM > 0 ? '+' : ''}{row.faultRateMoM}%</td>
                    <td className="py-2 font-din text-text-secondary">{row.avgRepairTime}小时</td>
                    <td className="py-2 font-din text-text-secondary">{row.fiberUtilization}%</td>
                    <td className="py-2">
                      <button className="btn-secondary text-xs" onClick={() => setSelectedIdx(i)}>
                        {i === selectedIdx ? '当前' : '查看'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
