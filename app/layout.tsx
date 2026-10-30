import './globals.css'
import ClientLayout from './components/ClientLayout'

export const metadata = {
  title: 'AI-Integrated Digital Learning Module | Food Services',
  description: 'Grade 9 • Revised K–10 Curriculum',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#faf8f6] text-[#2d241f] font-sans antialiased min-h-screen flex flex-col">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}