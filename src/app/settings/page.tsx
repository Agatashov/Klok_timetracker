import { getProjects, getClients, getTags } from '@/lib/actions'
import { ProjectsPanel, ClientsPanel, TagsPanel } from './Panels'

export default async function SettingsPage() {
  const [projects, clients, tags] = await Promise.all([
    getProjects(),
    getClients(),
    getTags(),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-7">
      <h1
        className="text-xl font-bold tracking-tight mb-7"
        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.02em' }}
      >
        Settings
      </h1>

      <div className="flex flex-col gap-8">
        <ProjectsPanel projects={projects} />
        <ClientsPanel clients={clients} />
        <TagsPanel tags={tags} />
      </div>
    </div>
  )
}
