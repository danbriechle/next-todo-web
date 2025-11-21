// src/lib/graphql.ts

export type Todo = {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
};

type TodosResponse = {
  data: {
    todos: Todo[];
  };
};

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:3000/graphql";

export async function fetchTodos(): Promise<Todo[]> {
  const query = `
    query Todos {
      todos {
        id
        title
        description
        completed
      }
    }
  `;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error("GraphQL error:", await res.text());
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  const json = (await res.json()) as TodosResponse;

  return json.data.todos;
}
