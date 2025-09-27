import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Lightweight in-memory mocks for /api in Vite dev server to satisfy E2E tests
function devApiMockPlugin() {
  // In-memory stores partitioned per User-Agent to avoid cross-project interference
  const partitions = new Map<string, {
    usersById: Map<string, any>;
    usersByEmail: Map<string, string>;
    winesByUser: Map<string, any[]>;
  }>();

  const getStore = (req: any) => {
    const cookieHeader = String(req.headers?.['cookie'] || '');
    const match = /(?:^|;\s*)x-test-session=([^;]+)/.exec(cookieHeader);
    const key = match?.[1] || String(req.headers?.['user-agent'] || 'default');
    let store = partitions.get(key);
    if (!store) {
      store = {
        usersById: new Map<string, any>(),
        usersByEmail: new Map<string, string>(),
        winesByUser: new Map<string, any[]>(),
      };
      partitions.set(key, store);
    }
    return store;
  };

  const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  const readJsonBody = async (req: any): Promise<any> =>
    new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk: any) => (raw += chunk));
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
    });

  const sendJson = (res: any, status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  return {
    name: 'dev-api-mock',
    configureServer(server: any) {
      // /api/init-db: reset the in-memory stores (GET or POST)
      server.middlewares.use('/api/init-db', async (req: any, res: any) => {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const { usersById, usersByEmail, winesByUser } = getStore(req);
        usersById.clear();
        usersByEmail.clear();
        winesByUser.clear();
        return sendJson(res, 200, {
          message: 'Database tables created successfully',
          tables: ['users', 'wines'],
        });
      });

      // /api/auth: signup/login/admin-login/get-all-users
      server.middlewares.use('/api/auth', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const body = await readJsonBody(req);
        const action = body?.action;
        const { usersById, usersByEmail } = getStore(req);

        switch (action) {
          case 'signup': {
            const email = (body?.email || '').toLowerCase();
            const name = body?.name || '';
            const password = body?.password || '';
            if (!email || !password) {
              return sendJson(res, 200, {
                success: false,
                error: 'Missing fields',
              });
            }
            if (password.length < 6) {
              return sendJson(res, 200, {
                success: false,
                error: 'Password must be at least 6 characters long',
              });
            }
            if (usersByEmail.has(email)) {
              return sendJson(res, 200, {
                success: false,
                error: 'User with this email already exists',
              });
            }
            const id = generateId();
            const user = { id, email: body.email, name };
            usersById.set(id, user);
            usersByEmail.set(email, id);
            return sendJson(res, 200, { success: true, user });
          }

          case 'login': {
            const emailLower = (body?.email || '').toLowerCase();
            const id = usersByEmail.get(emailLower);
            if (!id) {
              return sendJson(res, 200, {
                success: false,
                error: 'Invalid email or password',
              });
            }
            const user = usersById.get(id);
            return sendJson(res, 200, { success: true, user });
          }

          case 'admin-login': {
            // Allow any credentials to simulate admin login for tests
            return sendJson(res, 200, { success: true });
          }

          case 'get-all-users': {
            const list = Array.from(usersById.values()).map((u) => ({
              id: u.id,
              email: u.email,
              name: u.name,
            }));
            return sendJson(res, 200, list);
          }

          default:
            return sendJson(res, 400, { error: 'Invalid action' });
        }
      });

      // /api/wines: get-wines/add-wine/update-wine/delete-wine
      server.middlewares.use('/api/wines', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const body = await readJsonBody(req);
        const { action, userId, wineId, wineData } = body || {};
        const { winesByUser } = getStore(req);

        if (!userId) {
          return sendJson(res, 400, { error: 'User ID is required' });
        }

        switch (action) {
          case 'get-wines': {
            const list = winesByUser.get(userId) || [];
            return sendJson(res, 200, list);
          }

          case 'add-wine': {
            const id = generateId();
            const now = new Date().toISOString();
            const wine = {
              id,
              name: wineData?.name || '',
              vintage:
                typeof wineData?.vintage === 'number'
                  ? wineData.vintage
                  : undefined,
              rating:
                typeof wineData?.rating === 'number' ? wineData.rating : 3,
              notes: wineData?.notes || '',
              photo: wineData?.photo,
              dateAdded: now,
              dateModified: now,
            };
            const list = winesByUser.get(userId) || [];
            list.push(wine);
            winesByUser.set(userId, list);
            return sendJson(res, 200, { success: true, wine });
          }

          case 'update-wine': {
            const list = winesByUser.get(userId) || [];
            const idx = list.findIndex((w: any) => w.id === wineId);
            if (idx === -1) {
              return sendJson(res, 200, {
                success: false,
                error: 'Wine not found or unauthorized',
              });
            }
            const updated = {
              ...list[idx],
              ...wineData,
              dateModified: new Date().toISOString(),
            };
            list[idx] = updated;
            winesByUser.set(userId, list);
            return sendJson(res, 200, { success: true });
          }

          case 'delete-wine': {
            const list = winesByUser.get(userId) || [];
            const next = list.filter((w: any) => w.id !== wineId);
            winesByUser.set(userId, next);
            return sendJson(res, 200, { success: true });
          }

          default:
            return sendJson(res, 400, { error: 'Invalid action' });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiMockPlugin()],
  server: {
    port: 5174,
    strictPort: true,
  },
});
