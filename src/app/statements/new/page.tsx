import { getProjects } from '@/lib/actions'
import { NewStatementForm } from './NewStatementForm'

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function NewStatementPage({ searchParams }: PageProps) {
  const params = await searchParams
  const projects = await getProjects()

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-6" style={{ color: 'var(--foreground)' }}>
        New statement
      </h1>
      <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <NewStatementForm
          projects={projects.map(p => ({ id: p.id, name: p.name, client: p.client }))}
          defaultFrom={params.from}
          defaultTo={params.to}
        />
      </div>
    </div>
  )
}
