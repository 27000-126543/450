import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Bell,
  ClipboardCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { UserRole } from '@/types'

const navItems = [
  { path: '/', label: '全国总览', icon: LayoutDashboard },
  { path: '/province/北京', label: '省份下钻', icon: MapPin },
  { path: '/alerts', label: '预警中心', icon: Bell },
  { path: '/inspection', label: '巡检管理', icon: ClipboardCheck },
  { path: '/reports', label: '运维报告', icon: FileText },
]

const roleLabels: Record<UserRole, string> = {
  group: '省公司网络部',
  province: '区域经理',
  city: '运维班组长',
}

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const { userRole, setUserRole, userProvince, setUserProvince, userCity, setUserCity } = useAppStore()
  const alertCount = useAppStore((s) => s.alertEvents.filter((a) => a.status === 'pending' || a.status === 'escalated').length)

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <aside
        className={`flex flex-col border-r border-border transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[220px]'
        }`}
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-cyan-dark flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-text-primary whitespace-nowrap">光缆运维平台</h1>
              <p className="text-[10px] text-text-muted whitespace-nowrap">Fiber Optic O&M</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan/10 text-cyan border border-cyan/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-card'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {item.path === '/alerts' && alertCount > 0 && (
                <span className="ml-auto bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {alertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-4 space-y-2">
          {!collapsed && (
            <div className="px-3 py-2 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs text-text-muted">当前角色</span>
              </div>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="w-full bg-secondary text-text-primary text-xs rounded px-2 py-1.5 border border-border outline-none focus:border-cyan"
              >
                <option value="group">省公司网络部</option>
                <option value="province">区域经理</option>
                <option value="city">运维班组长</option>
              </select>
              {userRole === 'province' && (
                <select
                  value={userProvince}
                  onChange={(e) => setUserProvince(e.target.value)}
                  className="w-full bg-secondary text-text-primary text-xs rounded px-2 py-1.5 border border-border outline-none focus:border-cyan mt-1.5"
                >
                  <option value="北京">北京</option>
                  <option value="上海">上海</option>
                  <option value="广东">广东</option>
                  <option value="江苏">江苏</option>
                  <option value="浙江">浙江</option>
                  <option value="四川">四川</option>
                  <option value="湖北">湖北</option>
                  <option value="山东">山东</option>
                  <option value="河南">河南</option>
                  <option value="福建">福建</option>
                </select>
              )}
              {userRole === 'city' && (
                <select
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="w-full bg-secondary text-text-primary text-xs rounded px-2 py-1.5 border border-border outline-none focus:border-cyan mt-1.5"
                >
                  <option value="北京">北京</option>
                  <option value="上海">上海</option>
                  <option value="广州">广州</option>
                  <option value="深圳">深圳</option>
                  <option value="南京">南京</option>
                  <option value="杭州">杭州</option>
                  <option value="成都">成都</option>
                  <option value="重庆">重庆</option>
                  <option value="武汉">武汉</option>
                  <option value="济南">济南</option>
                </select>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-card transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-6" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-text-primary">全国通信光缆网络运维与故障预警分析平台</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge badge-cyan">{roleLabels[userRole]}</span>
            {(userRole === 'province' || userRole === 'city') && (
              <span className="text-xs text-text-muted">
                {userRole === 'province' ? userProvince : userCity}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center">
              <User className="w-4 h-4 text-cyan" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--bg-primary)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
