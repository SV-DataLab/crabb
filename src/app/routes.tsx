import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { CapacitacionesPage } from '../pages/CapacitacionesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DataTecnicaPage } from '../pages/DataTecnicaPage'
import { InstitucionalPage } from '../pages/InstitucionalPage'
import { AdminCuotasPage } from '../pages/AdminCuotasPage'
import { AdminGestionCobranzasPage } from '../pages/AdminGestionCobranzasPage'
import { AdminInstitucionalPage } from '../pages/AdminInstitucionalPage'
import { AdminSitioWebPage } from '../pages/AdminSitioWebPage'
import { AdminSitioWebPortadaPage } from '../pages/AdminSitioWebPortadaPage'
import { AdminSitioWebServiciosPage } from '../pages/AdminSitioWebServiciosPage'
import { AdminSitioWebFooterPage } from '../pages/AdminSitioWebFooterPage'
import { AdminSitioWebContactoRedesPage } from '../pages/AdminSitioWebContactoRedesPage'
import { AdminSitioWebNavegacionPage } from '../pages/AdminSitioWebNavegacionPage'
import { AdminSitioWebOportunidadesPage } from '../pages/AdminSitioWebOportunidadesPage'
import { AdminSitioWebSobreCrabbPage } from '../pages/AdminSitioWebSobreCrabbPage'
import { DataDeletionPage } from '../pages/DataDeletionPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage'
import { SocioAccountRegistrationPage } from '../pages/SocioAccountRegistrationPage'
import { SocioJoinPage } from '../pages/SocioJoinPage'
import { TermsPage } from '../pages/TermsPage'
import { BuscarColegasPage } from '../pages/BuscarColegasPage'
import { PerfilSocioPage } from '../pages/PerfilSocioPage'
import { SocioSolicitudesPage } from '../pages/SocioSolicitudesPage'
import { SocioCarnetPage } from '../pages/SocioCarnetPage'
import { SocioPerfilPage } from '../pages/SocioPerfilPage'
import { SocioUnlinkedAccountPage } from '../pages/SocioUnlinkedAccountPage'
import { PublicCarnetPage } from '../pages/PublicCarnetPage'
import { AdminOnlyRoute, ProtectedRoute, PublicOnlyRoute, SocioOnlyRoute } from './routeGuards'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/privacidad',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terminos',
    element: <TermsPage />,
  },
  {
    path: '/eliminacion-de-datos',
    element: <DataDeletionPage />,
  },
  {
    path: '/carnet/:token',
    element: <PublicCarnetPage />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/asociarme',
    element: (
      <PublicOnlyRoute>
        <SocioJoinPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/registro-socio',
    element: (
      <PublicOnlyRoute>
        <SocioAccountRegistrationPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: 'institucional', element: <InstitucionalPage /> },
      { path: 'capacitaciones', element: <CapacitacionesPage /> },
      { path: 'data-tecnica', element: <DataTecnicaPage /> },
      { path: 'perfil', element: (
          <AdminOnlyRoute>
            <PerfilSocioPage />
          </AdminOnlyRoute>
        ) },
      { path: 'colegas', element: <BuscarColegasPage /> },
      {
        path: 'mi-carnet',
        element: (
          <SocioOnlyRoute>
            <SocioCarnetPage />
          </SocioOnlyRoute>
        ),
      },
      {
        path: 'mi-perfil',
        element: (
          <SocioOnlyRoute>
            <SocioPerfilPage />
          </SocioOnlyRoute>
        ),
      },
      {
        path: 'cuenta-sin-socio',
        element: <SocioUnlinkedAccountPage />,
      },
      {
        path: 'admin/solicitudes-socios',
        element: (
          <AdminOnlyRoute>
            <SocioSolicitudesPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/cuotas',
        element: (
          <AdminOnlyRoute>
            <AdminCuotasPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/gestion-cobranzas',
        element: (
          <AdminOnlyRoute>
            <AdminGestionCobranzasPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/institucional',
        element: (
          <AdminOnlyRoute>
            <AdminInstitucionalPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/portada',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebPortadaPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/servicios',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebServiciosPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/footer',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebFooterPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/contacto-redes',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebContactoRedesPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/sobre-crabb',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebSobreCrabbPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/navegacion',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebNavegacionPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin/sitio-web/oportunidades',
        element: (
          <AdminOnlyRoute>
            <AdminSitioWebOportunidadesPage />
          </AdminOnlyRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <AdminOnlyRoute>
            <Navigate to="/admin/sitio-web" replace />
          </AdminOnlyRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
