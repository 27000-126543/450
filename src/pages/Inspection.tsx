import { useState, useCallback } from 'react'
import { Upload, FileSpreadsheet, MapPin, Clock, Cable, Route, AlertTriangle, RotateCcw } from 'lucide-react'
import * as XLSX from 'xlsx'
import ReactECharts from 'echarts-for-react'
import { useAppStore } from '@/store/useAppStore'

const riskOrder = { high: 0, medium: 1, low: 2 }
const riskBadge = { high: 'badge-red', medium: 'badge-orange', low: 'badge-green' }
const riskLabel = { high: '高风险', medium: '中风险', low: '低风险' }

export default function Inspection() {
  const { riskPredictions, recommendedRoutes, spliceSchemes, uploadInspectionPlan, resetInspectionData } = useAppStore()
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [parsed, setParsed] = useState(false)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.xlsx?$/)) return
    setUploadedFile(file.name)
    setParsed(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const json: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      setPreviewData(json.slice(0, 5))
      setParsed(true)
      uploadInspectionPlan(file.name, json)
      setUploaded(true)
    }
    reader.readAsArrayBuffer(file)
  }, [uploadInspectionPlan])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const handleReset = () => {
    resetInspectionData()
    setUploaded(false)
    setUploadedFile(null)
    setParsed(false)
    setPreviewData([])
  }

  const sortedRisks = [...riskPredictions].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])

  const routes = recommendedRoutes

  const chartOption = {
    backgroundColor: 'transparent',
    grid: { top: 20, bottom: 40, left: 60, right: 20 },
    xAxis: { type: 'category', data: routes.map(r => r.name), axisLabel: { color: '#94a3b8', fontSize: 11 }, axisLine: { lineStyle: { color: '#334155' } } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [{ type: 'bar', data: routes.map(r => r.priorityScore), itemStyle: { color: '#06b6d4', borderRadius: [4, 4, 0, 0] }, barWidth: '40%' }],
    tooltip: { trigger: 'axis', backgroundColor: '#1e293b', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  }

  return (
    <div className="space-y-4">
      <div className="card card-glow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary font-medium flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan" /> 年度巡检计划上传
          </h3>
          {uploaded && (
            <button onClick={handleReset} className="btn-secondary text-xs flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> 重置数据
            </button>
          )}
        </div>
        <div
          className={`border border-dashed ${dragOver ? 'border-cyan' : 'border-border'} rounded-lg p-8 text-center transition-colors cursor-pointer`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <FileSpreadsheet className="w-10 h-10 text-text-muted mx-auto mb-2" />
          <p className="text-text-secondary text-sm">拖拽或点击上传 .xlsx / .xls 文件</p>
          {uploadedFile && (
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-cyan text-sm font-din">{uploadedFile}</span>
              {parsed && <span className="badge badge-green">解析完成</span>}
              {parsed && uploaded && <span className="badge badge-green">预测数据已生成</span>}
            </div>
          )}
          <input id="file-input" type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        {uploaded && parsed && (
          <div className="mt-3 text-xs text-cyan flex items-center gap-2">
            <span>已根据文件内容重新计算，共生成 {riskPredictions.length} 条风险预测项</span>
          </div>
        )}
        {previewData.length > 0 && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-text-secondary">
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {row.map((cell, j) => <td key={j} className="px-2 py-1 whitespace-nowrap">{String(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card card-glow p-4">
        <h3 className="text-text-primary font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> 未来90天高风险光缆段预测
          {uploaded && <span className="badge badge-cyan text-[10px] ml-2">已上传</span>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedRisks.map((r) => (
            <div key={r.cableSegmentId} className="bg-card-hover rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`badge ${riskBadge[r.riskLevel]}`}>{riskLabel[r.riskLevel]}</span>
                <span className="text-text-muted text-xs font-din">{r.predictedDate}</span>
              </div>
              <p className="text-text-primary text-sm">{r.cableSegmentName}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">置信度</span>
                  <span className="text-cyan font-din stat-value text-sm">{(r.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="health-bar"><div className="health-bar-fill" style={{ width: `${r.confidence * 100}%` }} /></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.riskFactors.map((f) => <span key={f} className="badge badge-cyan text-[10px]">{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-glow p-4">
        <h3 className="text-text-primary font-medium mb-3 flex items-center gap-2">
          <Route className="w-4 h-4 text-cyan" /> 推荐巡检路线
          {uploaded && <span className="badge badge-cyan text-[10px] ml-2">已上传</span>}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {routes.map((r) => (
              <div key={r.id} className="bg-card-hover rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">{r.name}</span>
                  <span className="text-cyan font-din stat-value">{r.priorityScore}</span>
                </div>
                <div className="health-bar"><div className="health-bar-fill bg-cyan" style={{ width: `${r.priorityScore}%` }} /></div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.totalDistance}km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.estimatedTime}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.segments.map((s) => <span key={s} className="badge badge-cyan text-[10px]">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
          <ReactECharts option={chartOption} style={{ height: 260 }} />
        </div>
      </div>

      <div className="card card-glow p-4">
        <h3 className="text-text-primary font-medium mb-3 flex items-center gap-2">
          <Cable className="w-4 h-4 text-cyan" /> 备纤熔接方案推荐
          {uploaded && <span className="badge badge-cyan text-[10px] ml-2">已上传</span>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spliceSchemes.map((s) => (
            <div key={s.id} className="bg-card-hover rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-sm font-medium">{s.splicePoint}</span>
                <span className="flex items-center gap-1 text-cyan text-xs font-din"><Cable className="w-3 h-3" />{s.fiberCount}芯</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />预计{s.estimatedTime}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.requiredMaterials.map((m) => <span key={m} className="badge badge-cyan text-[10px]">{m}</span>)}
              </div>
              <button className="btn-secondary text-xs w-full">查看详情</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
