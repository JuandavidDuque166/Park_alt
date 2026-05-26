import React from 'react';
import { 
  Car, 
  LayoutDashboard, 
  ArrowRightToLine, 
  ArrowLeftToLine, 
  Settings, 
  CreditCard, 
  LogOut, 
  X 
} from 'lucide-react';

// Componente reutilizable para el Sidebar
const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </div>
);

// Componente principal con nombre consistente
export default function IngresovehiculosOperario() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen fixed left-0">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Car size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Sistema</h1>
              <h1 className="font-bold text-lg leading-tight">Parqueadero</h1>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-2">Operario</p>
        </div>

        <nav className="flex-1 mt-6">
          <SidebarItem icon={LayoutDashboard} label="Inicio" />
          <SidebarItem icon={ArrowRightToLine} label="Ingreso Vehículos" active />
          <SidebarItem icon={ArrowLeftToLine} label="Salida Vehículos" />
          <SidebarItem icon={Settings} label="Control Parqueadero" />
          <SidebarItem icon={CreditCard} label="Mensualidades" />
        </nav>

        <div className="p-6 border-t border-gray-700">
          <p className="text-gray-400 text-xs mb-1">Usuario</p>
          <p className="font-semibold mb-4">Juan Vigilante</p>
          <button className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors text-sm font-medium">
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="mb-6 flex items-start gap-4">
          <button className="mt-1 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Ingreso Vehículos</h2>
            <p className="text-gray-500 text-sm">Gestión en altura y subterráneo</p>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Car className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Registro de Ingreso de Vehículos</h3>
                <p className="text-gray-500">Complete los datos del vehículo que ingresa</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Espacios disponibles</p>
              <p className="text-2xl font-bold text-green-600">98 / 100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa *</label>
              <input type="text" placeholder="ABC123" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo *</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>Carro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nivel / Zona *</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>Nivel 1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (URL)</label>
              <input type="text" placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
            <p><span className="font-semibold text-gray-800">Fecha y hora:</span> Se registrarán automáticamente al momento del ingreso</p>
            <p><span className="font-semibold text-gray-800">Vigilante:</span> Juan Vigilante</p>
          </div>

          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Registrar Ingreso
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors">
              Limpiar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}