import './globals.css';
export const metadata={title:'RAB Cost Control',description:'Project cost control + Accurate Online integration'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="id"><body><div className="nav"><div className="wrap"><a className="brand" href="/">RAB Cost Control</a><a href="/">Dashboard</a><a href="/projects">Project</a><a href="/api/health">Health</a></div></div>{children}</body></html>}
