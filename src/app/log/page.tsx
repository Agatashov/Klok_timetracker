import { getEntriesGroupedByDay } from '@/lib/actions'
import { getProjects } from '@/lib/actions'
import { getTags } from '@/lib/actions'
import { LogShell } from '@/components/LogShell'

export default async function LogPage() {
  const [groups, allProjects, allTags] = await Promise.all([
    getEntriesGroupedByDay(),
    getProjects(),
    getTags(),
  ])

  return (
    <LogShell
      groups={groups}
      projects={allProjects.map(p => ({ ...p, client: p.client }))}
      tags={allTags}
    />
  )
}
