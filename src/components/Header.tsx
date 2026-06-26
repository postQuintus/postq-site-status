'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import PersonalAccountButton from './PersonalAccountButton'

const NAV_LINKS = [
    { label: 'Тарифы',          href: 'https://postq.space/#pricing' },
    { label: 'Как подключить',  href: 'https://postq.space/#howto'   },
    { label: 'FAQ',              href: 'https://postq.space/#faq'     },
    { label: 'Статус серверов', href: '/'                             },
]

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (scrolled) setMobileOpen(false)
    }, [scrolled])

    return (
        <header
            className="fixed left-0 right-0 z-50"
            style={{ top: 0, padding: '8px 8px 0', transform: 'translateZ(0)', willChange: 'transform' }}
        >
            <div className="max-w-6xl mx-auto">

                {/* Liquid glass pill */}
                <div
                    style={{
                        position: 'relative',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(40px)',
                        WebkitBackdropFilter: 'blur(40px)',
                        border: '1px solid rgba(207,0,163,0.07)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                        overflow: 'hidden',
                    }}
                >
                    <div className="px-3 flex items-center justify-between h-14">

                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <a href="https://postq.space" className="flex items-center gap-2.5 no-underline">
                                <div className="relative h-8 w-8 shrink-0">
                                    <Image src="/icons/icon.svg" alt="postq logo" fill className="object-contain" />
                                </div>
                                <span className="font-display" style={{ fontSize: '16px', color: 'var(--text)' }}>
                                    postq vpn
                                </span>
                            </a>
                        </motion.div>

                        {/* Desktop nav */}
                        <motion.nav
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="hidden md:flex items-center gap-9"
                        >
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="nav-link"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </motion.nav>

                        {/* Right: account button + burger */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div className="hidden md:block">
                                <PersonalAccountButton />
                            </div>

                            {/* Burger */}
                            <button
                                className="md:hidden"
                                onClick={() => setMobileOpen(v => !v)}
                                aria-label="Меню"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', width: 24, height: 24 }}>
                                    <motion.span
                                        animate={mobileOpen
                                            ? { rotate: 45, y: 6.5, backgroundColor: 'rgba(207,0,163,0.9)' }
                                            : { rotate: 0,  y: 0,   backgroundColor: 'rgba(215,194,240,0.7)' }}
                                        transition={{ duration: 0.22 }}
                                        style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
                                    />
                                    <motion.span
                                        animate={mobileOpen
                                            ? { scaleX: 0, opacity: 0 }
                                            : { scaleX: 1, opacity: 1, backgroundColor: 'rgba(215,194,240,0.7)' }}
                                        transition={{ duration: 0.15 }}
                                        style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
                                    />
                                    <motion.span
                                        animate={mobileOpen
                                            ? { rotate: -45, y: -6.5, backgroundColor: 'rgba(207,0,163,0.9)' }
                                            : { rotate: 0,   y: 0,    backgroundColor: 'rgba(215,194,240,0.7)' }}
                                        transition={{ duration: 0.22 }}
                                        style={{ display: 'block', height: 1.5, borderRadius: 2, transformOrigin: 'center' }}
                                    />
                                </div>
                            </button>
                        </motion.div>
                    </div>

                    {/* Mobile menu */}
                    <AnimatePresence>
                        {mobileOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                            >
                                <div style={{ padding: '8px 20px 18px', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid rgba(207,0,163,0.1)' }}>
                                    {NAV_LINKS.map((link, i) => (
                                        <motion.a
                                            key={link.label}
                                            href={link.href}
                                                    initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => setMobileOpen(false)}
                                            className="nav-link"
                                            style={{ fontSize: '15px', color: 'rgba(215,194,240,0.65)', padding: '10px 0', borderBottom: '1px solid rgba(207,0,163,0.06)', textAlign: 'left', width: '100%', borderRadius: 0 }}
                                        >
                                            {link.label}
                                        </motion.a>
                                    ))}
                                    <div style={{ marginTop: '12px' }}>
                                        <PersonalAccountButton />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>{/* /liquid glass pill */}
            </div>{/* /max-w-6xl */}
        </header>
    )
}
