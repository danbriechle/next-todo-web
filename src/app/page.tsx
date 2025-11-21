// src/app/page.tsx
import { fetchTodos } from '@/lib/graphql';

export default async function HomePage() {
  const todos = await fetchTodos();

  return (
    <main className="min-h-screen flex flex-col items-center bg-slate-50 p-8">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-600">Todo Dashboard</h1>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          {todos.length === 0 ? (
            <p className="text-slate-900 text-sm">No todos yet.</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start justify-between rounded-lg border text-slate-600 border-slate-200 px-3 py-2 bg-slate-50"
                >
                  <div>
                    <p className="font-medium">
                      {todo.completed ? '✅ ' : '⬜️ '}
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-slate-500 mt-1">{todo.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
