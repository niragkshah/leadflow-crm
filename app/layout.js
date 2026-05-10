import './globals.css'

export const metadata = {
  title: 'LeadFlow CRM',
  description: 'Simple lead generation CRM for growing teams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
