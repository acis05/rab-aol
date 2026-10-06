import './globals.css'; import AppShell from '@/components/AppShell';
export const metadata={title:'RAB Cost Control',description:'Project cost control terintegrasi Accurate Online'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><AppShell>{children}</AppShell></body></html>}
