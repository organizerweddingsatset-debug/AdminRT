
import './globals.css'
export const metadata = { title: 'RT 09 Admin' }
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html><body className="bg-[#0F1220] text-white">{children}</body></html>
}
