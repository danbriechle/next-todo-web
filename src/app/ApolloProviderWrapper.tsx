'use client';

import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/lib/apolloClient';

export default function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
