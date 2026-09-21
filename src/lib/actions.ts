'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { todayLocal } from '@/lib/date'
import { nanoid } from 'nanoid'

// ─── Entries ────────────────────────────────────────────────────────────────

export interface EntryInput {
  description?: string
  date?: string
  startTime?: string
  endTime?: string
  durationSeconds: number
  projectId?: string | null
  tagIds?: string[]
}

export async function getEntriesGroupedByDay() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: { project: { include: { client: true } }, tags: { include: { tag: true } } },
  })
  const groups: Record<string, typeof entries> = {}
  for (const e of entries) {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  }
  return groups
}

export async function createEntry(input: EntryInput) {
  const entry = await prisma.timeEntry.create({
    data: {
      description: input.description?.trim() ?? '',
      date: input.date ?? todayLocal(),
      startTime: input.startTime || null,
      endTime: input.endTime || null,
      durationSeconds: input.durationSeconds,
      projectId: input.projectId ?? null,
      tags: input.tagIds?.length ? { create: input.tagIds.map(tagId => ({ tagId })) } : undefined,
    },
  })
  revalidatePath('/log')
  revalidatePath('/insights')
  return entry
}

export async function updateEntry(id: string, input: EntryInput) {
  await prisma.tagEntry.deleteMany({ where: { entryId: id } })
  await prisma.timeEntry.update({
    where: { id },
    data: {
      description: input.description?.trim() ?? '',
      date: input.date ?? todayLocal(),
      startTime: input.startTime || null,
      endTime: input.endTime || null,
      durationSeconds: input.durationSeconds,
      projectId: input.projectId ?? null,
      tags: input.tagIds?.length ? { create: input.tagIds.map(tagId => ({ tagId })) } : undefined,
    },
  })
  revalidatePath('/log')
  revalidatePath('/insights')
}

export async function deleteEntry(id: string) {
  await prisma.timeEntry.delete({ where: { id } })
  revalidatePath('/log')
  revalidatePath('/insights')
}

export async function toggleEntryPaid(id: string, paid: boolean) {
  await prisma.timeEntry.update({ where: { id }, data: { paid } })
  revalidatePath('/log')
  revalidatePath('/statements')
}

// ─── Projects ───────────────────────────────────────────────────────────────

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { name: 'asc' },
    include: { client: true, _count: { select: { entries: true } } },
  })
}

export async function createProject(name: string, color: string, clientName?: string) {
  const clientId = await resolveClientId(clientName)
  const project = await prisma.project.create({ data: { name: name.trim(), color, clientId } })
  revalidatePath('/settings')
  revalidatePath('/log')
  return project
}

export async function updateProject(id: string, name: string, color: string, clientName?: string) {
  const clientId = await resolveClientId(clientName)
  await prisma.project.update({ where: { id }, data: { name: name.trim(), color, clientId } })
  revalidatePath('/settings')
  revalidatePath('/log')
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } })
  revalidatePath('/settings')
  revalidatePath('/log')
  revalidatePath('/insights')
}

// ─── Clients ────────────────────────────────────────────────────────────────

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { projects: true } } },
  })
}

export async function createClient(name: string) {
  const client = await prisma.client.create({ data: { name: name.trim() } })
  revalidatePath('/settings')
  return client
}

export async function updateClient(id: string, name: string) {
  await prisma.client.update({ where: { id }, data: { name: name.trim() } })
  revalidatePath('/settings')
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } })
  revalidatePath('/settings')
  revalidatePath('/log')
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { entries: true } } },
  })
}

export async function createTag(name: string) {
  const tag = await prisma.tag.create({ data: { name: name.trim() } })
  revalidatePath('/settings')
  revalidatePath('/log')
  return tag
}

export async function updateTag(id: string, name: string) {
  await prisma.tag.update({ where: { id }, data: { name: name.trim() } })
  revalidatePath('/settings')
  revalidatePath('/log')
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } })
  revalidatePath('/settings')
  revalidatePath('/log')
}

export async function findOrCreateTag(name: string) {
  return prisma.tag.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  })
}

// ─── Statements ─────────────────────────────────────────────────────────────

export async function getStatements() {
  return prisma.statement.findMany({
    orderBy: { createdAt: 'desc' },
    include: { project: { include: { client: true } } },
  })
}

export async function getStatementBySlug(slug: string) {
  return prisma.statement.findUnique({
    where: { slug },
    include: { project: { include: { client: true } } },
  })
}

export async function createStatement(title: string, dateFrom: string, dateTo: string, projectId?: string | null) {
  const statement = await prisma.statement.create({
    data: { title: title.trim(), dateFrom, dateTo, projectId: projectId ?? null, slug: nanoid(12) },
  })
  revalidatePath('/statements')
  return statement
}

export async function deleteStatement(id: string) {
  await prisma.statement.delete({ where: { id } })
  revalidatePath('/statements')
}

export async function markStatementEntriesPaid(dateFrom: string, dateTo: string, projectId: string | null | undefined, paid: boolean) {
  await prisma.timeEntry.updateMany({
    where: { date: { gte: dateFrom, lte: dateTo }, ...(projectId ? { projectId } : {}) },
    data: { paid },
  })
  revalidatePath('/statements')
  revalidatePath('/log')
}

export async function getStatementEntries(dateFrom: string, dateTo: string, projectId?: string | null) {
  return prisma.timeEntry.findMany({
    where: { date: { gte: dateFrom, lte: dateTo }, ...(projectId ? { projectId } : {}) },
    orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    include: { project: { include: { client: true } }, tags: { include: { tag: true } } },
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveClientId(clientName?: string): Promise<string | null> {
  if (!clientName?.trim()) return null
  const client = await prisma.client.upsert({
    where: { name: clientName.trim() },
    update: {},
    create: { name: clientName.trim() },
  })
  return client.id
}
