import Link from 'next/link'
import { DollarSign, Twitter, Linkedin, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
                <DollarSign className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-white">
                Surplus<span className="text-brand-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              The #1 platform for finding and recovering unclaimed surplus funds from foreclosures, tax sales, and sheriff auctions nationwide.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-800 transition-colors"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Surplus Database', '/search'],
                ['County Directory', '/counties'],
                ['Lead Marketplace', '/marketplace'],
                ['Pricing', '/pricing'],
              ].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['About', '/about'],
                ['Blog', '/blog'],
                ['Careers', '/careers'],
                ['Contact', '/contact'],
              ].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
                ['Cookie Policy', '/cookies'],
                ['Data Usage', '/data-usage'],
              ].map(([label, href]) => (
                <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} SurplusFlow. All rights reserved. Proprietary and Confidential.</p>
          <p className="text-xs">Data sourced from public records. Not legal advice.</p>
        </div>
      </div>
    </footer>
  )
}
