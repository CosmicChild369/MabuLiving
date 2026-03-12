/**
 * pages.config.js - Page routing configuration
 *
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 */
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminComplaints from './pages/AdminComplaints';
import AdminConcernForms from './pages/AdminConcernForms';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';
import Analytics from './pages/Analytics';
import Announcements from './pages/Announcements';
import Complaints from './pages/Complaints';
import ConcernForms from './pages/ConcernForms';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Payments from './pages/Payments';
import TenantDirectory from './pages/TenantDirectory';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import TenantRegister from './pages/TenantRegister';
import AdminOTPs from './pages/AdminOTPs';
import AdminInvoices from './pages/AdminInvoices';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';

export const PAGES = {
    "AdminAnnouncements": AdminAnnouncements,
    "AdminComplaints": AdminComplaints,
    "AdminConcernForms": AdminConcernForms,
    "AdminDashboard": AdminDashboard,
    "AdminPayments": AdminPayments,
    "Analytics": Analytics,
    "Announcements": Announcements,
    "Complaints": Complaints,
    "ConcernForms": ConcernForms,
    "Dashboard": Dashboard,
    "Messages": Messages,
    "Payments": Payments,
    "TenantDirectory": TenantDirectory,
    "Landing": Landing,
    "SignIn": SignIn,
    "TenantRegister": TenantRegister,
    "AdminOTPs": AdminOTPs,
    "AdminInvoices": AdminInvoices,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
