'use client';

import { FormEvent, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TODOS, CREATE_TODO, UPDATE_TODO } from '@/graphql/todos';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

type GetTodosData = {
  todos: Todo[];
};

type CreateTodoData = {
  createTodo: Todo;
};

type CreateTodoVars = {
  title: string;
};

type UpdateTodoData = {
  updateTodo: Todo;
};

type UpdateTodoVars = {
  id: string;
  title?: string;
  completed?: boolean;
};

export default function TodosPage() {
  const { data, loading, error } = useQuery<GetTodosData>(GET_TODOS);

  const [createTodo] = useMutation<CreateTodoData, CreateTodoVars>(CREATE_TODO, {
    update(cache, { data }) {
      if (!data?.createTodo) return;

      const existing = cache.readQuery<GetTodosData>({
        query: GET_TODOS,
      });

      if (!existing) return;

      cache.writeQuery<GetTodosData>({
        query: GET_TODOS,
        data: {
          todos: [...existing.todos, data.createTodo],
        },
      });
    },
  });

  const [updateTodo] = useMutation<UpdateTodoData, UpdateTodoVars>(UPDATE_TODO);

  const [newTitle, setNewTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState<Record<string, string>>({});

  if (loading) return <p>Loading todos…</p>;
  if (error) return <p>Error loading todos: {error.message}</p>;

  const todos = data?.todos ?? [];

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    await createTodo({
      variables: { title },
    });

    setNewTitle('');
  };

  const handleToggleCompleted = async (todo: Todo) => {
    await updateTodo({
      variables: {
        id: todo.id,
        completed: !todo.completed,
      },
      optimisticResponse: {
        updateTodo: {
          id: todo.id,
          title: todo.title,
          completed: !todo.completed,
        },
      },
    });
  };

  const handleTitleChange = (id: string, value: string) => {
    setEditingTitle((prev) => ({ ...prev, [id]: value }));
  };

  const handleTitleBlur = async (todo: Todo) => {
    const edited = editingTitle[todo.id]?.trim();
    if (!edited || edited === todo.title) return;

    await updateTodo({
      variables: {
        id: todo.id,
        title: edited,
      },
      optimisticResponse: {
        updateTodo: {
          id: todo.id,
          title: edited,
          completed: todo.completed,
        },
      },
    });
  };

  return (
    <main
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>Todos</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="New todo title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ padding: '0.5rem', width: '70%', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Add
        </button>
      </form>

      {/* List */}
      {todos.length === 0 ? (
        <p>No todos yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.5rem',
                gap: '0.5rem',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleCompleted(todo)}
              />
              <input
                type="text"
                value={editingTitle[todo.id] ?? todo.title}
                onChange={(e) => handleTitleChange(todo.id, e.target.value)}
                onBlur={() => handleTitleBlur(todo)}
                style={{
                  flex: 1,
                  padding: '0.25rem 0.5rem',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
