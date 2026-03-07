'use client';

import { useCallback } from 'react';
import { LinkSearchProvider, CopyAssistProvider } from '@verevoir/editor';
import type { CopyAssistRequest } from '@verevoir/editor';
import { UserProvider } from '@/context/UserContext';
import { searchLinkableDocuments } from '@/actions/link-search';
import { generateCopy } from '@/actions/copy-assist';
import { AdminSidebar } from './AdminSidebar';
import styles from './AdminShell.module.css';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const search = useCallback(
    (query: string) => searchLinkableDocuments(query),
    [],
  );

  const generate = useCallback((request: CopyAssistRequest) => {
    return generateCopy({
      fieldName: request.fieldName,
      fieldLabel: request.fieldLabel,
      hint: request.hint,
      currentValue: request.currentValue,
      context: request.context,
    });
  }, []);

  return (
    <UserProvider>
      <LinkSearchProvider search={search}>
        <CopyAssistProvider generate={generate}>
          <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.main}>{children}</main>
          </div>
        </CopyAssistProvider>
      </LinkSearchProvider>
    </UserProvider>
  );
}
