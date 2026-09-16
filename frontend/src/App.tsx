import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenances from './pages/Maintenances';
import Fuels from './pages/Fuels';
import Expenses from './pages/Expenses';
import Tires from './pages/Tires';
import Reminders from './pages/Reminders';
import Alerts from './pages/Alerts';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/maintenances" element={<Maintenances />} />
          <Route path="/fuels" element={<Fuels />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/tires" element={<Tires />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;