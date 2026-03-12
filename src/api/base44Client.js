const STORAGE_KEY = "mabu_mock_db_v1";
const AUTH_KEY = "mabu_mock_auth_v1";

const defaultUser = {
  role: "tenant",
  full_name: "User",
  email: "user@example.com",
};

const defaultDb = {
  Announcement: [],
  Complaint: [],
  ConcernForm: [],
  Message: [],
  Notification: [],
  Payment: [],
  RegistrationOTP: [],
  TenantProfile: [
    {
      id: "tenant_1",
      user_email: "user@example.com",
      full_name: "User",
      unit_number: "A101",
      monthly_rent: 6500,
      status: "active",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    },
  ],
};

const listeners = {};

function isBrowser() {
  return typeof window !== "undefined";
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readDb() {
  if (!isBrowser()) return structuredClone(defaultDb);
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
    return structuredClone(defaultDb);
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultDb), ...parsed };
  } catch {
    return structuredClone(defaultDb);
  }
}

function writeDb(db) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function readUser() {
  if (!isBrowser()) return defaultUser;
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return defaultUser;
  }
}

function writeUser(user) {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function applyFilter(list, filterObj = {}) {
  if (!filterObj || typeof filterObj !== "object") return list;
  return list.filter((row) =>
    Object.entries(filterObj).every(([key, value]) => row?.[key] === value)
  );
}

function applySort(list, sortBy) {
  if (!sortBy) return [...list];
  const desc = String(sortBy).startsWith("-");
  const field = desc ? String(sortBy).slice(1) : String(sortBy);
  return [...list].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av === bv) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av > bv) return desc ? -1 : 1;
    return desc ? 1 : -1;
  });
}

function applyLimit(list, limit) {
  if (!limit || Number(limit) <= 0) return list;
  return list.slice(0, Number(limit));
}

function emit(entityName, type, data) {
  const subs = listeners[entityName] || [];
  subs.forEach((cb) => {
    try {
      cb({ type, data });
    } catch {
      // noop
    }
  });
}

function createEntityApi(entityName) {
  return {
    list: async (sortBy, limit) => {
      const db = readDb();
      const rows = db[entityName] || [];
      return applyLimit(applySort(rows, sortBy), limit);
    },

    filter: async (filterObj, sortBy, limit) => {
      const db = readDb();
      const rows = db[entityName] || [];
      const filtered = applyFilter(rows, filterObj);
      return applyLimit(applySort(filtered, sortBy), limit);
    },

    create: async (data = {}) => {
      const db = readDb();
      const now = new Date().toISOString();
      const record = {
        id: uid(entityName.toLowerCase()),
        ...data,
        created_date: now,
        updated_date: now,
      };
      db[entityName] = [record, ...(db[entityName] || [])];
      writeDb(db);
      emit(entityName, "create", record);
      return record;
    },

    update: async (id, data = {}) => {
      const db = readDb();
      let updated = null;
      db[entityName] = (db[entityName] || []).map((row) => {
        if (row.id !== id) return row;
        updated = {
          ...row,
          ...data,
          updated_date: new Date().toISOString(),
        };
        return updated;
      });
      writeDb(db);
      if (updated) emit(entityName, "update", updated);
      return updated || null;
    },

    delete: async (id) => {
      const db = readDb();
      const existing = db[entityName] || [];
      const deleted = existing.find((row) => row.id === id) || null;
      db[entityName] = existing.filter((row) => row.id !== id);
      writeDb(db);
      if (deleted) emit(entityName, "delete", deleted);
      return { success: true };
    },

    subscribe: (callback) => {
      if (!listeners[entityName]) listeners[entityName] = [];
      listeners[entityName].push(callback);
      return () => {
        listeners[entityName] = (listeners[entityName] || []).filter((cb) => cb !== callback);
      };
    },
  };
}

function inferUserFromTarget(targetUrl = "") {
  const admin = String(targetUrl).toLowerCase().includes("admin");
  if (admin) {
    return {
      role: "admin",
      full_name: "Admin User",
      email: "admin",
    };
  }
  return {
    role: "tenant",
    full_name: "User",
    email: "user@example.com",
  };
}

export const base44 = {
  auth: {
    me: async () => readUser(),

    logout: (redirectUrl) => {
      writeUser(defaultUser);
      if (isBrowser() && redirectUrl) window.location.href = redirectUrl;
    },

    redirectToLogin: (targetUrl) => {
      const user = inferUserFromTarget(targetUrl);
      writeUser(user);
      if (isBrowser() && targetUrl) window.location.href = targetUrl;
    },
  },

  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (isBrowser() && file instanceof File) {
          return { file_url: URL.createObjectURL(file) };
        }
        return { file_url: "" };
      },
    },
  },

  entities: {
    Announcement: createEntityApi("Announcement"),
    Complaint: createEntityApi("Complaint"),
    ConcernForm: createEntityApi("ConcernForm"),
    Message: createEntityApi("Message"),
    Notification: createEntityApi("Notification"),
    Payment: createEntityApi("Payment"),
    RegistrationOTP: createEntityApi("RegistrationOTP"),
    TenantProfile: createEntityApi("TenantProfile"),
  },
};
