import { useState } from 'react'
import { Download, FileText, Lightbulb, ChevronDown } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '@/store/useAppStore'

const priorityColors: Record<number, string> = { 0: 'border-cyan', 1: 'border-warning', 2: 'border-success' }
const priorityBadge: Record<number, string> = { 0: 'badge-cyan', 1: 'badge-orange', 2: 'badge-green' }
const priorityLabel: Record<number, string> = { 0: '高', 1: '中', 2: '低' }

const yoyColor = (v: number) => v <= 0 ? 'text-success' : 'text-danger'

export default function Reports() {
  const { weeklyReports } = useAppStore()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const report = weeklyReports[selectedIdx] ?? weeklyReports[0]

  const faultTypes = Object.keys(report.faultTypeDistribution)
  const currentValues = Object.values(report.faultTypeDistribution)
  const prevReport = weeklyReports[selectedIdx + 1]
  const prevValues = prevReport ? faultTypes.map((k) => prevReport.faultTypeDistribution[k] ?? 0) : currentValues.map(() => 0)
  const totalFaults = currentValues.reduce((a, b) => a + b, 0)

  const ranking = [...report.repairTimeRanking].sort((a, b) => a.avgHours - b.avgHours)
  const maxHours = Math.max(...ranking.map((r) => r.avgHours), 1)

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">运维诊断报告</h1>
          <p className="text-sm text-text-muted">每周自动生成</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="btn-secondary flex items-center gap-2" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <FileText size={16} />
              {report.weekStart} ~ {report.weekEnd}
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 min-w-[240px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {weeklyReports.map((r, i) => (
                  <button key={r.id} className={`w-full px-4 py-2 text-left text-sm hover:bg-card-hover ${i === selectedIdx ? 'text-cyan' : 'text-text-secondary'}`}
                    onClick={() => { setSelectedIdx(i); setDropdownOpen(false) }}>
                    {r.weekStart} ~ {r.weekEnd}
                  </button>
                ))}
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
          <p className={`stat-value font-din ${yoyColor(report.faultRateYoY)}`}>{report.faultRateYoY > 0 ? '+' : ''}{report.faultRateYoY}%</p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">故障率环比</p>
          <p className={`stat-value font-din ${yoyColor(report.faultRateMoM)}`}>{report.faultRateMoM > 0 ? '+' : ''}{report.faultRateMoM}%</p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">平均修复时长</p>
          <p className="stat-value font-din text-text-primary">{report.avgRepairTime}<span className="text-sm text-text-muted ml-1">小时</span></p>
        </div>
        <div className="card card-glow p-4">
          <p className="text-xs text-text-muted">纤芯利用率</p>
          <p className="stat-value font-din text-text-primary">{(report.fiberUtilization * 100).toFixed(0)}%</p>
          <div className="health-bar mt-2"><div className="health-bar-fill" style={{ width: `${report.fiberUtilization * 100}%` }} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">故障类型对比</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'axis' }, legend: { data: ['本周', '上周'], textStyle: { color: '#9ca3af' } },
            xAxis: { type: 'category', data: faultTypes, axisLabel: { color: '#9ca3af' } },
            yAxis: { type: 'value', axisLabel: { color: '#9ca3af' }, splitLine: { lineStyle: { color: '#1e293b' } } },
            series: [
              { name: '本周', type: 'bar', data: currentValues, itemStyle: { color: '#06b6d4' } },
              { name: '上周', type: 'bar', data: prevValues, itemStyle: { color: '#475569' } },
            ],
          }} style={{ height: 260 }} />
        </div>
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">修复时长排名</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'axis' }, grid: { left: 60, right: 20, top: 10, bottom: 20 },
            xAxis: { type: 'value', name: '小时', axisLabel: { color: '#9ca3af' }, splitLine: { lineStyle: { color: '#1e293b' } } },
            yAxis: { type: 'category', data: ranking.map((r) => r.province), axisLabel: { color: '#9ca3af' } },
            series: [{ type: 'bar', data: ranking.map((r) => ({ value: r.avgHours, itemStyle: { color: `rgb(${Math.round((r.avgHours / maxHours) * 239)}, ${Math.round((1 - r.avgHours / maxHours) * 200 + 55)}, 68)` } })) }],
          }} style={{ height: 260 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">故障类型分布</h3>
          <ReactECharts option={{
            tooltip: { trigger: 'item' }, color: ['#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'],
            series: [{ type: 'pie', radius: ['45%', '70%'], label: { color: '#9ca3af' },
              data: faultTypes.map((k, i) => ({ name: k, value: currentValues[i] })),
              emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } } }],
            graphic: [{ type: 'text', left: 'center', top: 'middle', style: { text: `${totalFaults}`, fontSize: 28, fontWeight: 'bold', fill: '#f1f5f9', textAlign: 'center' } }],
          }} style={{ height: 280 }} />
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">策略优化建议</h3>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <div key={i} className={`rounded-lg border-l-4 ${priorityColors[i % 3]} bg-card-hover p-3`}>
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-cyan" />
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
              {weeklyReports.map((r, i) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-2 text-text-secondary">{r.weekStart} ~ {r.weekEnd}</td>
                  <td className={`py-2 font-din ${yoyColor(r.faultRateYoY)}`}>{r.faultRateYoY > 0 ? '+' : ''}{r.faultRateYoY}%</td>
                  <td className={`py-2 font-din ${yoyColor(r.faultRateMoM)}`}>{r.faultRateMoM > 0 ? '+' : ''}{r.faultRateMoM}%</td>
                  <td className="py-2 font-din text-text-secondary">{r.avgRepairTime}小时</td>
                  <td className="py-2 font-din text-text-secondary">{(r.fiberUtilization * 100).toFixed(0)}%</td>
                  <td className="py-2">
                    <button className="btn-secondary text-xs" onClick={() => setSelectedIdx(i)}>查看</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
