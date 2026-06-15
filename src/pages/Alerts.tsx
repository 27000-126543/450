import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, CheckCircle2, XCircle, CircleDot, ShieldAlert, ArrowUpCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import ReactECharts from 'echarts-for-react'

const FILTERS = ['全部', '一级预警', '二级预警', '待处理', '已升级'] as const
const STEP_LABELS = ['班组长确认', '区域经理复核', '省公司批准']
const ROLE_LABELS: Record<string, string> = {
  city: '属地运维班组长',
  province: '区域经理',
  group: '省公司网络部',
}
const STATUS_BADGE: Record<string, [string, string]> = {
  pending: ['badge-orange', '待处理'],
  processing: ['badge-cyan', '处理中'],
  escalated: ['badge-red', '已升级'],
  approved: ['badge-green', '已批准'],
  closed: ['badge-green', '已关闭'],
}

export default function Alerts() {
  const { getFilteredAlerts, handleAlertAction, userRole, canApproveCurrentStep, getCurrentApprovalStep, getCurrentApprovalRole } = useAppStore()
  const alerts = getFilteredAlerts()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('全部')
  const [now, setNow] = useState(Date.now())

  useEffect(() => { getFilteredAlerts() }, [])

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])

  const filtered = alerts.filter((a) => {
    if (filter === '一级预警') return a.level === 1
    if (filter === '二级预警') return a.level === 2
    if (filter === '待处理') return a.status === 'pending'
    if (filter === '已升级') return a.status === 'escalated'
    return true
  })

  const selected = alerts.find((a) => a.id === selectedId)

  const getCountdown = (createdAt: string) => {
    const deadline = new Date(createdAt).getTime() + 2 * 60 * 60 * 1000
    const diff = deadline - now
    if (diff <= 0) return null
    const m = Math.floor(diff / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { text: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, urgent: diff < 30 * 60 * 1000 }
  }

  const chartOption = (triggerData: { timestamp: string; value: number }[]) => ({
    backgroundColor: 'transparent',
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category', data: triggerData.map((d) => d.timestamp.slice(11, 16)), axisLine: { lineStyle: { color: '#1E3A5F' } }, axisLabel: { color: '#5A7A9E', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1E3A5F22' } }, axisLabel: { color: '#5A7A9E', fontSize: 10 } },
    series: [{ type: 'line', data: triggerData.map((d) => d.value), smooth: true, symbol: 'circle', symbolSize: 6, itemStyle: { color: '#00D4FF' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0.02)' }] } }, lineStyle: { color: '#00D4FF', width: 2 } }],
    tooltip: { trigger: 'axis', backgroundColor: '#152238', borderColor: '#1E3A5F', textStyle: { color: '#E8F0FE', fontSize: 12 } },
  })

  const getStepStatus = (flow: typeof selected.approvalFlow, idx: number) => {
    if (!flow || idx >= flow.length) return 'pending' as const
    const step = flow.find((s) => s.step === idx + 1)
    return step?.status ?? 'pending'
  }

  const currentStepIdx = selected ? getCurrentApprovalStep(selected) : -1
  const currentStepRole = selected ? getCurrentApprovalRole(selected) : null
  const canApprove = selected ? canApproveCurrentStep(selected) : false
  const hasRejected = selected?.approvalFlow.some((s) => s.status === 'rejected') ?? false
  const allApproved = selected?.approvalFlow.every((s) => s.status === 'approved') ?? false

  return (
    <div className="flex h-full gap-4 p-4">
      <div className="w-[40%] flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-warning" />
          <span className="text-text-primary font-semibold text-lg">预警列表</span>
          <span className="badge badge-orange font-din">{alerts.length}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-cyan/15 text-cyan border border-cyan/30' : 'bg-card text-text-muted border border-border hover:text-text-secondary'}`}>{f}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.map((alert) => (
            <div key={alert.id} onClick={() => setSelectedId(alert.id)} className={`card p-3 cursor-pointer transition-all ${selectedId === alert.id ? 'border-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)]' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${alert.level === 1 ? 'badge-orange pulse-orange' : 'badge-red pulse-red'}`}>{alert.level === 1 ? '一级' : '二级'}</span>
                <span className="font-semibold text-text-primary text-sm truncate">{alert.cableSegmentName}</span>
              </div>
              <div className="text-xs text-text-secondary">{alert.province} &gt; {alert.city}</div>
              <div className="text-xs text-text-secondary mt-0.5">{alert.triggerReason}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-text-muted">{alert.createdAt.slice(5, 16)}</span>
                <span className={`badge ${STATUS_BADGE[alert.status][0]}`}>{STATUS_BADGE[alert.status][1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-[60%] flex flex-col gap-3 overflow-y-auto">
        {!selected ? (
          <div className="flex-1 card flex items-center justify-center text-text-muted"><AlertTriangle className="w-6 h-6 mr-2" />请选择一条预警查看详情</div>
        ) : (
          <>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${selected.level === 1 ? 'badge-orange pulse-orange' : 'badge-red pulse-red'}`}>{selected.level === 1 ? '一级' : '二级'}</span>
                <span className="text-text-primary font-bold text-lg">{selected.cableSegmentName}</span>
              </div>
              <div className="text-sm text-text-secondary mb-1">{selected.triggerReason}</div>
              <div className="text-xs text-text-muted flex items-center gap-1"><Clock className="w-3 h-3" />{selected.createdAt}</div>
            </div>

            {selected.level === 1 && selected.status === 'pending' && (() => {
              const cd = getCountdown(selected.createdAt)
              if (!cd) return null
              return (
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-text-muted mb-1">升级倒计时</div>
                    <div className={`font-din text-3xl ${cd.urgent ? 'text-danger pulse-red' : 'text-warning'}`} style={{ textShadow: cd.urgent ? '0 0 15px rgba(255,23,68,0.5)' : '0 0 15px rgba(255,145,0,0.5)' }}>{cd.text}</div>
                  </div>
                  <button className="btn-primary flex items-center gap-1" onClick={() => handleAlertAction(selected.id, 'escalate', 0)}><ArrowUpCircle className="w-4 h-4" />立即升级</button>
                </div>
              )
            })()}

            <div className="card p-4">
              <div className="text-sm font-semibold text-text-primary mb-2">触发数据</div>
              <ReactECharts option={chartOption(selected.triggerData)} style={{ height: 180 }} />
            </div>

            <div className="card p-4">
              <div className="text-sm font-semibold text-text-primary mb-4">审批流程</div>
              <div className="flex items-start justify-between relative">
                {[0, 1, 2].map((idx) => {
                  const stepStatus = getStepStatus(selected.approvalFlow, idx)
                  const stepData = selected.approvalFlow[idx]
                  const isCurrent = currentStepIdx === idx
                  const prevApproved = idx === 0 || getStepStatus(selected.approvalFlow, idx - 1) === 'approved'
                  return (
                    <div key={idx} className="flex flex-col items-center relative z-10" style={{ width: '33.33%' }}>
                      <div className="flex items-center w-full">
                        {idx > 0 && <div className={`flex-1 h-0.5 ${getStepStatus(selected.approvalFlow, idx - 1) === 'approved' ? 'bg-success' : 'bg-border'}`} />}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          stepStatus === 'approved' ? 'bg-success/20 border-2 border-success' :
                          stepStatus === 'rejected' ? 'bg-danger/20 border-2 border-danger' :
                          isCurrent && canApprove ? 'bg-cyan/20 border-2 border-cyan pulse-orange' :
                          isCurrent && !canApprove ? 'bg-warning/10 border-2 border-warning' :
                          'bg-card border-2 border-border'
                        }`}>
                          {stepStatus === 'approved' ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                           stepStatus === 'rejected' ? <XCircle className="w-4 h-4 text-danger" /> :
                           isCurrent && canApprove ? <CircleDot className="w-4 h-4 text-cyan" /> :
                           <span className={`text-xs ${isCurrent && !canApprove ? 'text-warning' : 'text-text-muted'}`}>{idx + 1}</span>}
                        </div>
                        {idx < 2 && <div className={`flex-1 h-0.5 ${stepStatus === 'approved' ? 'bg-success' : 'bg-border'}`} />}
                      </div>
                      <div className="text-xs font-medium text-text-primary mt-2">{STEP_LABELS[idx]}</div>
                      <div className="text-xs text-text-muted mt-0.5">{stepData?.approver ?? '—'}</div>
                      {isCurrent && canApprove && (
                        <div className="flex gap-1 mt-2">
                          <button className="btn-primary text-xs px-2 py-0.5" onClick={() => handleAlertAction(selected.id, 'approve', idx + 1)}>批准</button>
                          <button className="btn-secondary text-xs px-2 py-0.5" onClick={() => handleAlertAction(selected.id, 'reject', idx + 1)}>驳回</button>
                        </div>
                      )}
                      {isCurrent && !canApprove && currentStepRole && (
                        <div className="text-xs text-warning mt-2">等待{ROLE_LABELS[currentStepRole]}处理</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="card p-4">
              {allApproved ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="badge badge-green text-sm px-4 py-1.5">审批流程完成，可执行割接方案</span>
                </div>
              ) : hasRejected ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="badge badge-red text-sm px-4 py-1.5">审批被驳回，请查看详情</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-sm text-text-secondary">
                    当前待处理：<span className="text-text-primary font-medium">{currentStepRole ? ROLE_LABELS[currentStepRole] : '—'}</span>
                  </div>
                  {canApprove && currentStepIdx >= 0 && (
                    <div className="flex gap-2">
                      <button className="btn-primary px-6" onClick={() => handleAlertAction(selected.id, 'approve', currentStepIdx + 1)}>批准</button>
                      <button className="btn-secondary px-6" onClick={() => handleAlertAction(selected.id, 'reject', currentStepIdx + 1)}>驳回</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
