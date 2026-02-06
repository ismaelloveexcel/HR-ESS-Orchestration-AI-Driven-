/**
 * API Configuration
 * 
 * Update API_BASE_URL when deploying to production
 */

// For local development, use your computer's IP address
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
export const API_BASE_URL = 'http://192.168.1.100:3000'; // Replace with your IP

// For production
// export const API_BASE_URL = 'https://your-api.azurewebsites.net';

export const api = {
  // Auth
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  me: `${API_BASE_URL}/api/auth/me`,

  // Attendance
  clockQuick: `${API_BASE_URL}/api/attendance/quick`,
  clockStatus: `${API_BASE_URL}/api/attendance/status`,

  // Portal
  portalHome: `${API_BASE_URL}/api/portal/home`,
  quickLinks: `${API_BASE_URL}/api/portal/quick-links`,
  checkStatus: (ref: string) => `${API_BASE_URL}/api/portal/check-status/${ref}`,
  profile: `${API_BASE_URL}/api/portal/profile`,

  // Education
  educationOverview: `${API_BASE_URL}/api/education/overview`,
  laborLaw: `${API_BASE_URL}/api/education/uae-labor-law`,
  laborLawTopic: (id: string) => `${API_BASE_URL}/api/education/uae-labor-law/${id}`,
  tips: `${API_BASE_URL}/api/education/tips`,
  faq: `${API_BASE_URL}/api/education/faq`,

  // Leave
  leaveBalance: `${API_BASE_URL}/api/leave/balance`,
  leaveSubmit: `${API_BASE_URL}/api/leave`,
  leaveRequests: `${API_BASE_URL}/api/leave`,

  // Requests
  documentRequest: `${API_BASE_URL}/api/requests`,
  requestTypes: `${API_BASE_URL}/api/requests/types`,
};
