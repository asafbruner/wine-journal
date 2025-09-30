import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Types for in-memory mock data
interface MockUser {
  id: string;
  email: string;
  name?: string;
  password_hash: string;
  date_created: string;
  passwordHash?: string;
  dateCreated?: string;
}

interface MockWine {
  id: string;
  name: string;
  vintage?: number;
  rating: number;
  notes: string;
  photo?: string;
  dateAdded: string;
  dateModified: string;
}

interface IncomingRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  on(event: string, callback: (...args: unknown[]) => void): void;
}

interface ServerResponse {
  statusCode?: number;
  setHeader(name: string, value: string): void;
  end(data?: string): void;
}

// Lightweight in-memory mocks for /api in Vite dev server to satisfy E2E tests
function devApiMockPlugin() {
  // In-memory stores partitioned per User-Agent to avoid cross-project interference
  const partitions = new Map<string, {
    usersById: Map<string, MockUser>;
    usersByEmail: Map<string, string>;
    winesByUser: Map<string, MockWine[]>;
  }>();

  const getStore = (req: IncomingRequest) => {
    const cookieHeader = String(req.headers?.['cookie'] || '');
    const match = /(?:^|;\s*)x-test-session=([^;]+)/.exec(cookieHeader);
    const key = match?.[1] || String(req.headers?.['user-agent'] || 'default');
    let store = partitions.get(key);
    if (!store) {
      store = {
        usersById: new Map<string, MockUser>(),
        usersByEmail: new Map<string, string>(),
        winesByUser: new Map<string, MockWine[]>(),
      };
      
      // Pre-populate with a test user and sample wines
      const testUserId = 'test-user-123';
      const testUser: MockUser = {
        id: testUserId,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'mock:password',
        date_created: new Date().toISOString(),
      };
      
      store.usersById.set(testUserId, testUser);
      store.usersByEmail.set('test@example.com', testUserId);
      
      // Pre-populate with sample wines
      const sampleWines: MockWine[] = [
        {
          id: 'wine-1',
          name: 'Château Margaux 2015',
          vintage: 2015,
          rating: 5,
          notes: 'Exceptional Bordeaux with rich, complex flavors. Dark fruit, cedar, and tobacco notes. Perfect tannins.',
          dateAdded: new Date('2024-01-15').toISOString(),
          dateModified: new Date('2024-01-15').toISOString(),
        },
        {
          id: 'wine-2',
          name: 'Cloudy Bay Sauvignon Blanc',
          vintage: 2022,
          rating: 4,
          notes: 'Crisp and refreshing New Zealand white. Citrus and tropical fruit with a mineral finish.',
          dateAdded: new Date('2024-02-20').toISOString(),
          dateModified: new Date('2024-02-20').toISOString(),
        },
        {
          id: 'wine-3',
          name: 'Barolo Riserva',
          vintage: 2016,
          rating: 5,
          notes: 'Outstanding Nebbiolo from Piedmont. Rose petals, tar, cherry, and earthy undertones. Age-worthy.',
          dateAdded: new Date('2024-03-10').toISOString(),
          dateModified: new Date('2024-03-10').toISOString(),
        },
        {
          id: 'wine-4',
          name: 'Dom Pérignon Champagne',
          vintage: 2012,
          rating: 5,
          notes: 'Elegant and sophisticated. Fine bubbles, brioche, citrus, and white flowers. Celebration perfection!',
          dateAdded: new Date('2024-04-05').toISOString(),
          dateModified: new Date('2024-04-05').toISOString(),
        },
        {
          id: 'wine-5',
          name: 'Opus One',
          vintage: 2018,
          rating: 4,
          notes: 'Napa Valley Bordeaux blend. Blackberry, cassis, and vanilla. Smooth and well-balanced.',
          dateAdded: new Date('2024-05-12').toISOString(),
          dateModified: new Date('2024-05-12').toISOString(),
        },
        {
          id: 'wine-6',
          name: 'Penfolds Grange',
          vintage: 2017,
          rating: 5,
          notes: 'Iconic Australian Shiraz. Powerful, full-bodied with blackberry, chocolate, and spice. Stunning!',
          dateAdded: new Date('2024-06-18').toISOString(),
          dateModified: new Date('2024-06-18').toISOString(),
        },
        {
          id: 'wine-7',
          name: 'Cakebread Cellars Chardonnay',
          vintage: 2021,
          rating: 4,
          notes: 'Classic Napa Chardonnay. Buttery with notes of apple, pear, and subtle oak. Great with seafood.',
          dateAdded: new Date('2024-07-22').toISOString(),
          dateModified: new Date('2024-07-22').toISOString(),
        },
        {
          id: 'wine-8',
          name: 'Rioja Gran Reserva',
          vintage: 2014,
          rating: 4,
          notes: 'Traditional Spanish red. Leather, tobacco, red fruit, and vanilla from American oak aging.',
          dateAdded: new Date('2024-08-30').toISOString(),
          dateModified: new Date('2024-08-30').toISOString(),
        },
      ];
      
      store.winesByUser.set(testUserId, sampleWines);
      
      partitions.set(key, store);
    }
    return store;
  };

  const generateId = (): string =>
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  const readJsonBody = async (req: IncomingRequest): Promise<Record<string, unknown>> =>
    new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk: unknown) => (raw += String(chunk)));
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
    });

  const sendJson = (res: ServerResponse, status: number, data: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  return {
    name: 'dev-api-mock',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: IncomingRequest, res: ServerResponse) => void) => void } }) {
      // /api/init-db: reset the in-memory stores (GET or POST)
      server.middlewares.use('/api/init-db', async (req: IncomingRequest, res: ServerResponse) => {
        if (req.method !== 'GET' && req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const { usersById, usersByEmail, winesByUser } = getStore(req);
        usersById.clear();
        usersByEmail.clear();
        winesByUser.clear();
        return sendJson(res, 200, {
          success: true,
          message: 'Database tables created successfully',
          tables: ['users', 'wines'],
        });
      });

      // /api/auth: signup/login/admin-login/get-all-users
      server.middlewares.use('/api/auth', async (req: IncomingRequest, res: ServerResponse) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const body = await readJsonBody(req);
        const action = body?.action;
        const { usersById, usersByEmail } = getStore(req);

        switch (action) {
          case 'signup': {
            const email = String(body?.email || '').toLowerCase();
            const name = String(body?.name || '');
            const password = String(body?.password || '');
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
            const dateCreated = new Date().toISOString();
            const passwordHash = `mock:${password}`;
            const user = { id, email: String(body.email), name, password_hash: passwordHash, date_created: dateCreated };
            usersById.set(id, user);
            usersByEmail.set(email, id);
            return sendJson(res, 200, { success: true, user: { id, email: String(body.email), name, dateCreated } });
          }

          case 'login': {
            const emailLower = String(body?.email || '').toLowerCase();
            const password = String(body?.password || '');
            const id = usersByEmail.get(emailLower);
            if (!id) {
              return sendJson(res, 200, {
                success: false,
                error: 'Invalid email or password',
              });
            }
            const user = usersById.get(id);
            if (!user) {
              return sendJson(res, 200, {
                success: false,
                error: 'Invalid email or password',
              });
            }
            // Check password (mock passwords are stored as "mock:password")
            const storedPassword = user.password_hash?.replace('mock:', '') || '';
            if (storedPassword !== password) {
              return sendJson(res, 200, {
                success: false,
                error: 'Invalid email or password',
              });
            }
            // Return formatted user object to match expected format
            return sendJson(res, 200, { 
              success: true, 
              user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                dateCreated: user.date_created 
              } 
            });
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
              passwordHash: u.password_hash || u.passwordHash || '',
              dateCreated: u.date_created || u.dateCreated || new Date().toISOString(),
            }));
            return sendJson(res, 200, list);
          }

          default:
            return sendJson(res, 400, { error: 'Invalid action' });
        }
      });

      // /api/wines: get-wines/add-wine/update-wine/delete-wine
      server.middlewares.use('/api/wines', async (req: IncomingRequest, res: ServerResponse) => {
        if (req.method !== 'POST') {
          return sendJson(res, 405, { error: 'Method not allowed' });
        }
        const body = await readJsonBody(req);
        const action = body?.action as string | undefined;
        const userId = body?.userId as string | undefined;
        const wineId = body?.wineId as string | undefined;
        const wineData = body?.wineData as Record<string, unknown> | undefined;
        const { winesByUser, usersById } = getStore(req);

        if (action !== 'get-all-wines' && !userId) {
          return sendJson(res, 400, { error: 'User ID is required' });
        }

        switch (action) {
          case 'get-wines': {
            // Add a small delay to simulate network latency and show loading animation
            await new Promise(resolve => setTimeout(resolve, 800));
            const list = winesByUser.get(userId!) || [];
            return sendJson(res, 200, list);
          }

          case 'get-all-wines': {
            const list: Array<MockWine & { userId: string; userEmail?: string; userName?: string }> = [];
            for (const [uid, userWines] of Array.from(winesByUser.entries())) {
              const user = usersById.get(uid);
              for (const w of userWines) {
                list.push({
                  id: w.id,
                  name: w.name,
                  vintage: w.vintage,
                  rating: w.rating,
                  notes: w.notes,
                  photo: w.photo,
                  dateAdded: w.dateAdded,
                  dateModified: w.dateModified,
                  userId: uid,
                  userEmail: user?.email,
                  userName: user?.name,
                });
              }
            }
            list.sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime());
            return sendJson(res, 200, list);
          }

          case 'add-wine': {
            const id = generateId();
            const now = new Date().toISOString();
            const wine = {
              id,
              name: String(wineData?.name || ''),
              vintage:
                typeof wineData?.vintage === 'number'
                  ? wineData.vintage
                  : undefined,
              rating:
                typeof wineData?.rating === 'number' ? wineData.rating : 3,
              notes: String(wineData?.notes || ''),
              photo: wineData?.photo as string | undefined,
              dateAdded: now,
              dateModified: now,
            };
            const list = winesByUser.get(userId!) || [];
            list.push(wine);
            winesByUser.set(userId!, list);
            return sendJson(res, 200, { success: true, wine });
          }

          case 'update-wine': {
            const list = winesByUser.get(userId!) || [];
            const idx = list.findIndex((w: MockWine) => w.id === wineId!);
            if (idx === -1) {
              return sendJson(res, 200, {
                success: false,
                error: 'Wine not found or unauthorized',
              });
            }
            const updated: MockWine = {
              ...list[idx],
              ...(wineData as Partial<MockWine>),
              dateModified: new Date().toISOString(),
            };
            list[idx] = updated;
            winesByUser.set(userId!, list);
            return sendJson(res, 200, { success: true });
          }

          case 'delete-wine': {
            const list = winesByUser.get(userId!) || [];
            const next = list.filter((w: MockWine) => w.id !== wineId!);
            winesByUser.set(userId!, next);
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
