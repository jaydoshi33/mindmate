import Link from "next/link";

export default function Navbar() {
    return(
        <nav className="bg-white shadow px-6 py-4 flex items-center justify-between text-black">
        <div className="text-2xl font-bold">MindMate</div>
        <div className="space-x-6 text-base font-medium">
            <Link href="/journal" className="hover:text-blue-600">Journal</Link>
            <Link href="/history" className="hover:text-blue-600">History</Link>
            <Link href="/insights" className="hover:text-blue-600">Insights</Link>
        </div>
        </nav>
    );
}