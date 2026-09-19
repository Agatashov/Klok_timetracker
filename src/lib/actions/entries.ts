'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { todayLocal } from '@/lib/date'

export interface EntryInput {
  description?: string
  date?: string
  startTime?: string
  endTime?: string
  durationSeconds: number
  billable?: boolean
  projectId?: string | null
  tagIds?: string[]
}

export async function createEntry(input: EntryInput) {
  const entry = await prisma.timeEntry.create({
    data: {
      description: input.description?.trim() ?? '',
      date: input.date ?? todayLocal(),
      startTime: input.startTime || null,
      endTime: input.endTime || null,
      durationSeconds: input.durationSeconds,
      billable: input.billable ?? false,
      projectId: input.projectId ?? null,
      tags: input.tagIds?.length
        ? { create: input.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
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
      billable: input.billable ?? false,
      projectId: input.projectId ?? null,
      tags: input.tagIds?.length
        ? { create: input.tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  })
  revalidatePath('/log')
  revalidatePath('/insights')
}

export async function toggleEntryPaid(id: string, paid: boolean) {
  await prisma.timeEntry.update({ where: { id }, data: { paid } })
  revalidatePath('/log')
  revalidatePath('/statements')
}

export async function deleteEntry(id: string) {
  await prisma.timeEntry.delete({ where: { id } })
  revalidatePath('/log')
  revalidatePath('/insights')
}

export async function getEntriesGroupedByDay() {
  const entries = await prisma.timeEntry.findMany({
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: {
      project: { include: { client: true } },
      tags: { include: { tag: true } },
    },
  })

  const groups: Record<string, typeof entries> = {}
  for (const e of entries) {
    if (!groups[e.date]) groups[e.date] = []
    groups[e.date].push(e)
  }
  return groups
}
