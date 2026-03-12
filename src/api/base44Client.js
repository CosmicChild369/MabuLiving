const noopAsync = async () => [];
const noopAsyncObj = async () => ({});

const entityApi = {
  list: noopAsync,
  filter: noopAsync,
  create: noopAsyncObj,
  update: noopAsyncObj,
  delete: noopAsyncObj,
  subscribe: () => () => {},
};

export const base44 = {
  auth: {
    me: async () => ({ role: "tenant", full_name: "User", email: "user@example.com" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: "" }),
    },
  },
  entities: {
    Announcement: { ...entityApi },
    Complaint: { ...entityApi },
    ConcernForm: { ...entityApi },
    Message: { ...entityApi },
    Notification: { ...entityApi },
    Payment: { ...entityApi },
    RegistrationOTP: { ...entityApi },
    TenantProfile: { ...entityApi },
  },
};
