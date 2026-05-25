import { PrismaClient } from '@prisma/client';
import bcrypt          from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Nexus...');

  // ── Workspace ─────────────────────────────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where:  { slug: 'acme-engineering' },
    update: {},
    create: {
      name:     'Acme Engineering',
      slug:     'acme-engineering',
      plan:     'PRO',
      isPublic: true,
    },
  });

  // ── Users ─────────────────────────────────────────────────────────────────
  const pw = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where:  { email: 'alice@acme.com' },
    update: {},
    create: { name: 'Alice Chen', email: 'alice@acme.com', hashedPassword: pw, role: 'OWNER', workspaceId: workspace.id },
  });
  await prisma.user.upsert({
    where:  { email: 'bob@acme.com' },
    update: {},
    create: { name: 'Bob Smith', email: 'bob@acme.com', hashedPassword: pw, role: 'ADMIN', workspaceId: workspace.id },
  });
  await prisma.user.upsert({
    where:  { email: 'carol@acme.com' },
    update: {},
    create: { name: 'Carol Wu',  email: 'carol@acme.com', hashedPassword: pw, role: 'MEMBER', workspaceId: workspace.id },
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  const api = await prisma.project.create({
    data: {
      name: 'Platform API', description: 'Core REST + GraphQL API',
      repoUrl: 'https://github.com/acme/platform-api',
      workspaceId: workspace.id,
    },
  });
  const mobile = await prisma.project.create({
    data: {
      name: 'Mobile App', description: 'React Native iOS & Android',
      repoUrl: 'https://github.com/acme/mobile',
      workspaceId: workspace.id,
    },
  });
  const web = await prisma.project.create({
    data: {
      name: 'Web Frontend', description: 'Next.js customer portal',
      repoUrl: 'https://github.com/acme/web',
      workspaceId: workspace.id,
    },
  });

  // ── Metrics ───────────────────────────────────────────────────────────────
  const now  = new Date();
  const ago  = (days: number) => new Date(now.getTime() - days * 86_400_000);

  const metricsData = [
    { projectId: api.id,    type: 'VELOCITY'    as const, value: 42, note: 'Sprint 24', recordedAt: ago(1)  },
    { projectId: api.id,    type: 'COVERAGE'    as const, value: 87, note: 'After refactor', recordedAt: ago(3) },
    { projectId: api.id,    type: 'UPTIME'      as const, value: 99.97, recordedAt: ago(7)  },
    { projectId: mobile.id, type: 'VELOCITY'    as const, value: 31, recordedAt: ago(2)  },
    { projectId: mobile.id, type: 'DEPLOYMENTS' as const, value: 4,  note: '4 releases this week', recordedAt: ago(4) },
    { projectId: web.id,    type: 'VELOCITY'    as const, value: 55, recordedAt: ago(1)  },
    { projectId: web.id,    type: 'COVERAGE'    as const, value: 73, recordedAt: ago(5)  },
    { projectId: web.id,    type: 'QUALITY'     as const, value: 92, note: 'Lighthouse score', recordedAt: ago(2) },
  ];

  await prisma.metric.createMany({ data: metricsData });

  // ── Builds ────────────────────────────────────────────────────────────────
  const buildsData = [
    { project: 'platform-api', branch: 'main',        status: 'SUCCESS'  as const, duration: 94,  commitSha: 'a1b2c3d', workspaceId: workspace.id, triggeredAt: ago(0.1) },
    { project: 'web-frontend', branch: 'main',        status: 'SUCCESS'  as const, duration: 182, commitSha: 'e4f5g6h', workspaceId: workspace.id, triggeredAt: ago(0.3) },
    { project: 'mobile-app',   branch: 'feat/auth',   status: 'FAILURE'  as const, duration: 47,  commitSha: 'i7j8k9l', workspaceId: workspace.id, triggeredAt: ago(0.5) },
    { project: 'platform-api', branch: 'fix/rate-limit', status: 'SUCCESS' as const, duration: 88, workspaceId: workspace.id, triggeredAt: ago(1) },
    { project: 'web-frontend', branch: 'feat/dashboard', status: 'SUCCESS' as const, duration: 210, workspaceId: workspace.id, triggeredAt: ago(1.5) },
    { project: 'mobile-app',   branch: 'main',        status: 'SUCCESS'  as const, duration: 63,  workspaceId: workspace.id, triggeredAt: ago(2) },
    { project: 'platform-api', branch: 'main',        status: 'FAILURE'  as const, duration: 12,  workspaceId: workspace.id, triggeredAt: ago(3) },
    { project: 'web-frontend', branch: 'main',        status: 'SUCCESS'  as const, duration: 195, workspaceId: workspace.id, triggeredAt: ago(4) },
  ];

  await prisma.build.createMany({ data: buildsData });

  console.log('✅ Seeded:');
  console.log(`   Workspace: ${workspace.name} (slug: ${workspace.slug})`);
  console.log(`   Users:     3 (alice@acme.com / password123)`);
  console.log(`   Projects:  3`);
  console.log(`   Metrics:   ${metricsData.length}`);
  console.log(`   Builds:    ${buildsData.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
