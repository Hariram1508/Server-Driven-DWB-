"use client";

import React from "react";

interface ClipboardItem {
  element: React.ReactElement;
  sourceId: string;
}

interface EditorSelectionContextValue {
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  clearSelection: () => void;
  toggleSelectedId: (id: string) => void;
  replaceSelectedId: (id: string) => void;
  clipboardItems: ClipboardItem[];
  setClipboardItems: React.Dispatch<React.SetStateAction<ClipboardItem[]>>;
}

const EditorSelectionContext =
  React.createContext<EditorSelectionContextValue | null>(null);

export const EditorSelectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [clipboardItems, setClipboardItems] = React.useState<ClipboardItem[]>(
    [],
  );

  const clearSelection = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  const replaceSelectedId = React.useCallback((id: string) => {
    setSelectedIds([id]);
  }, []);

  const toggleSelectedId = React.useCallback((id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((currentId) => currentId !== id);
      }

      return [...current, id];
    });
  }, []);

  const value = React.useMemo(
    () => ({
      selectedIds,
      setSelectedIds,
      clearSelection,
      toggleSelectedId,
      replaceSelectedId,
      clipboardItems,
      setClipboardItems,
    }),
    [
      selectedIds,
      clearSelection,
      toggleSelectedId,
      replaceSelectedId,
      clipboardItems,
    ],
  );

  return (
    <EditorSelectionContext.Provider value={value}>
      {children}
    </EditorSelectionContext.Provider>
  );
};

export const useEditorSelection = () => {
  const context = React.useContext(EditorSelectionContext);
  if (!context) {
    throw new Error(
      "useEditorSelection must be used within EditorSelectionProvider",
    );
  }

  return context;
};
