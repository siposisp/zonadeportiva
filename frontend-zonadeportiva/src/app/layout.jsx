import "./globals.css";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { geist } from './fonts'

export const metadata = {
  title: 'Zona Deportiva',
  description: 'Aplicación de zona deportiva',
}

export default function RootLayout({ children }) {
    return (
        <html lang="es" data-theme="light">
            <body className={geist.className + " min-h-screen flex flex-col"}>
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}