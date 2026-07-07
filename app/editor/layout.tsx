import { EditorLightTheme } from '@/components/editor/EditorLightTheme'

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditorLightTheme>
      <div className="editor-admin min-h-screen bg-gray-50 text-gray-900">{children}</div>
    </EditorLightTheme>
  )
}
