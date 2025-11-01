import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css'; // Cho phiên bản mới của Ant Design

import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Register from './pages/Register.jsx';
import HomePage from './pages/home/index.jsx';
import UserPage from './pages/User.jsx';
import JobPage from './pages/job/index.jsx';
import ClientJobDetailPage from './pages/job/details.jsx';
import CompanyPage from './pages/company/index.jsx';
import ClientCompanyDetailPage from './pages/company/details.jsx';
import ErrorPage from './pages/error.jsx';
import PrivateRoute from './pages/private.route.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import LayoutAdmin from './components/admin/layout.admin.jsx';
import CompanyTable from './pages/admin/company.jsx';
import UserTable from './pages/admin/user.jsx';
import ManagePage from './pages/admin/job/manage.jsx';
import ResumePage from './pages/admin/resume.jsx';
import PermissionPage from './pages/admin/permission.jsx';
import RolePage from './pages/admin/role.jsx';
import SavedJobsPage from "./pages/job/saved.jobs";
import AccountPage from './pages/account/index.jsx';
import PrivacyPage from './pages/static/privacy.jsx';
import TermsPage from './pages/static/terms.jsx';
import AboutPage from './pages/static/about.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: '/user',
        element: (
          <PrivateRoute>
            <UserPage />
          </PrivateRoute>
        ),
      },
      { path: '/job', element: <JobPage /> },
      { path: '/job/:id', element: <ClientJobDetailPage /> },
      { path: '/company', element: <CompanyPage /> },
      { path: '/company/:id', element: <ClientCompanyDetailPage /> },
      { path: "/saved-jobs", element: <SavedJobsPage /> }
      ,{ path: '/privacy', element: <PrivacyPage /> }
      ,{ path: '/terms', element: <TermsPage /> }
      ,{ path: '/about', element: <AboutPage /> }
      ,{ path: '/account', element: (
        <PrivateRoute>
          <AccountPage />
        </PrivateRoute>
      ) }
    ],
  },

  // Layout dành cho trang Admin
  {
    path: '/admin',
    element: (
      <LayoutAdmin />
    ),
    children: [
      { index: true, element: <h1>Admin Dashboard</h1> },
      { path: 'user', element: <PrivateRoute><UserTable /></PrivateRoute> },
      { path: 'job', element: <PrivateRoute><ManagePage /></PrivateRoute> },
      { path: 'company', element: <PrivateRoute><CompanyTable /></PrivateRoute> },
      { path: 'resume', element: <PrivateRoute><ResumePage /></PrivateRoute> },
      { path: 'permission', element: <PrivateRoute><PermissionPage /></PrivateRoute> },
      { path: 'role', element: <PrivateRoute><RolePage /></PrivateRoute> },
    ],
  },

  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <Register /> },
  { path: '*', element: <ErrorPage /> }, // ✅ Route 404
]);

createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <RouterProvider router={router} />
  </AuthWrapper>
);
