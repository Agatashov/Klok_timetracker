import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const exists = await db.project.findFirst({ where: { name: 'Website Redesign' } })
  if (exists) {
    console.log('Already seeded — skipping.')
    return
  }

  const acme = await db.client.upsert({ where: { name: 'Acme Corp' }, update: {}, create: { name: 'Acme Corp' } })
  const bloom = await db.client.upsert({ where: { name: 'Bloom Agency' }, update: {}, create: { name: 'Bloom Agency' } })

  const web    = await db.project.create({ data: { name: 'Website Redesign',    color: 'violet',  clientId: acme.id } })
  const app    = await db.project.create({ data: { name: 'Mobile App',          color: 'cyan',    clientId: acme.id } })
  const tools  = await db.project.create({ data: { name: 'Internal Tools',      color: 'emerald' } })
  const mkt    = await db.project.create({ data: { name: 'Marketing Campaign',  color: 'orange',  clientId: bloom.id } })

  const tDesign  = await db.tag.upsert({ where: { name: 'design' },      update: {}, create: { name: 'design' } })
  const tDev     = await db.tag.upsert({ where: { name: 'development' }, update: {}, create: { name: 'development' } })
  const tReview  = await db.tag.upsert({ where: { name: 'review' },      update: {}, create: { name: 'review' } })
  const tMeeting = await db.tag.upsert({ where: { name: 'meeting' },     update: {}, create: { name: 'meeting' } })

  const p = { web: web.id, app: app.id, tools: tools.id, mkt: mkt.id }
  const t = { d: tDesign.id, dev: tDev.id, r: tReview.id, m: tMeeting.id }

  const entries = [
    // Sep 2 (Tue)
    { desc: 'Homepage wireframes',        date: '2026-09-02', s: '09:15', e: '11:45', dur:  9000, bill: true,  proj: p.web,   tags: [t.d] },
    { desc: 'Client sync call',           date: '2026-09-02', s: '14:00', e: '15:00', dur:  3600, bill: true,  proj: p.web,   tags: [t.m] },
    { desc: 'Sprint planning',            date: '2026-09-02', s: '15:30', e: '16:30', dur:  3600, bill: false, proj: p.app,   tags: [t.m] },
    // Sep 3 (Wed)
    { desc: 'Auth flow implementation',   date: '2026-09-03', s: '09:00', e: '12:30', dur: 12600, bill: true,  proj: p.app,   tags: [t.dev] },
    { desc: 'PR review – navigation',     date: '2026-09-03', s: '13:30', e: '14:15', dur:  2700, bill: true,  proj: p.app,   tags: [t.r] },
    { desc: 'Deploy pipeline setup',      date: '2026-09-03', s: '15:00', e: '17:00', dur:  7200, bill: false, proj: p.tools, tags: [t.dev] },
    // Sep 4 (Thu)
    { desc: 'Design system tokens',       date: '2026-09-04', s: '09:30', e: '11:00', dur:  5400, bill: true,  proj: p.web,   tags: [t.d] },
    { desc: 'Email campaign mockups',     date: '2026-09-04', s: '11:30', e: '13:00', dur:  5400, bill: true,  proj: p.mkt,   tags: [t.d] },
    { desc: 'Database schema review',     date: '2026-09-04', s: '14:00', e: '15:00', dur:  3600, bill: false, proj: p.tools, tags: [t.r] },
    // Sep 5 (Fri)
    { desc: 'Onboarding screens',         date: '2026-09-05', s: '09:00', e: '12:00', dur: 10800, bill: true,  proj: p.app,   tags: [t.d, t.dev] },
    { desc: 'Weekly team review',         date: '2026-09-05', s: '16:00', e: '16:45', dur:  2700, bill: false, proj: p.tools, tags: [t.m] },
    // Sep 8 (Mon)
    { desc: 'Navigation component build', date: '2026-09-08', s: '09:00', e: '11:30', dur:  9000, bill: true,  proj: p.web,   tags: [t.dev] },
    { desc: 'Campaign A/B test setup',    date: '2026-09-08', s: '13:00', e: '14:30', dur:  5400, bill: true,  proj: p.mkt,   tags: [t.dev] },
    { desc: 'API documentation',          date: '2026-09-08', s: '15:00', e: '16:30', dur:  5400, bill: true,  proj: p.app,   tags: [t.dev] },
    // Sep 9 (Tue)
    { desc: 'Hero section layout',        date: '2026-09-09', s: '09:15', e: '12:00', dur: 10200, bill: true,  proj: p.web,   tags: [t.d] },
    { desc: 'Push notifications – iOS',   date: '2026-09-09', s: '13:30', e: '15:30', dur:  7200, bill: true,  proj: p.app,   tags: [t.dev] },
    // Sep 10 (Wed)
    { desc: 'Component library audit',    date: '2026-09-10', s: '09:00', e: '10:30', dur:  5400, bill: false, proj: p.tools, tags: [t.r] },
    { desc: 'Landing page copy edits',    date: '2026-09-10', s: '11:00', e: '12:00', dur:  3600, bill: true,  proj: p.mkt,   tags: [t.r] },
    { desc: 'Payment flow integration',   date: '2026-09-10', s: '13:00', e: '17:00', dur: 14400, bill: true,  proj: p.app,   tags: [t.dev] },
    // Sep 11 (Thu)
    { desc: 'Responsive breakpoints',     date: '2026-09-11', s: '09:30', e: '12:30', dur: 10800, bill: true,  proj: p.web,   tags: [t.dev] },
    { desc: 'Stakeholder review meeting', date: '2026-09-11', s: '14:00', e: '15:30', dur:  5400, bill: true,  proj: p.web,   tags: [t.m] },
    // Sep 12 (Fri)
    { desc: 'Analytics dashboard',        date: '2026-09-12', s: '09:00', e: '12:00', dur: 10800, bill: false, proj: p.tools, tags: [t.dev, t.d] },
    { desc: 'Social assets for campaign', date: '2026-09-12', s: '13:30', e: '15:30', dur:  7200, bill: true,  proj: p.mkt,   tags: [t.d] },
    // Sep 15 (Mon)
    { desc: 'Performance audit',          date: '2026-09-15', s: '09:00', e: '10:30', dur:  5400, bill: true,  proj: p.web,   tags: [t.r] },
    { desc: 'User testing session prep',  date: '2026-09-15', s: '11:00', e: '13:00', dur:  7200, bill: true,  proj: p.app,   tags: [t.d, t.m] },
    { desc: 'CI pipeline improvements',   date: '2026-09-15', s: '14:00', e: '16:30', dur:  9000, bill: false, proj: p.tools, tags: [t.dev] },
    // Sep 16 (Tue) — today
    { desc: 'Design handoff review',      date: '2026-09-16', s: '09:30', e: '11:00', dur:  5400, bill: true,  proj: p.web,   tags: [t.r] },
    { desc: 'Feedback implementation',    date: '2026-09-16', s: '11:30', e: '14:00', dur:  9000, bill: true,  proj: p.app,   tags: [t.dev] },
  ]

  for (const e of entries) {
    await db.timeEntry.create({
      data: {
        description: e.desc,
        date: e.date,
        startTime: e.s,
        endTime: e.e,
        durationSeconds: e.dur,
        billable: e.bill,
        projectId: e.proj,
        tags: { create: e.tags.map(tagId => ({ tagId })) },
      },
    })
  }

  console.log(`Seeded ${entries.length} entries across 11 days with 4 projects and 4 tags.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
