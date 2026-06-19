import { CvmkrLightTheme } from '@/components/cvmkr/CvmkrLightTheme'

export default function CvmkrLayout({ children }: { children: React.ReactNode }) {
  return (
    <CvmkrLightTheme>
      <div className="cvmkr-admin min-h-screen text-gray-900">{children}</div>
    </CvmkrLightTheme>
  )
}
