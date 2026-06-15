import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import ProvinceDetail from '@/pages/ProvinceDetail'
import Alerts from '@/pages/Alerts'
import Inspection from '@/pages/Inspection'
import Reports from '@/pages/Reports'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/province/:provinceId" element={<ProvinceDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  )
}
