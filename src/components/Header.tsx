'use client'

import Image from 'next/image'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import PersonalAccountButton from './PersonalAccountButton'

const NAV_LINKS = [
    { label: 'Цены',             href: 'https://postq.space/#pricing', external: true  },
    { label: 'Как подключить',   href: 'https://postq.space/#howto',   external: true  },
    { label: 'FAQ',               href: 'https://postq.space/#faq',     external: true  },
    { label: 'Статус серверов',  href: '/',                             external: false },
]

const USEFUL_LINKS = [
    { label: 'Узнать мой IP', href: 'https://postq.space/ip' },
]

export default function Header() {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [usefulOpen, setUsefulOpen] = useState(false)
    const [usefulPos, setUsefulPos] = useState<{ top: number; left: number } | null>(null)
    const [mounted, setMounted] = useState(false)
    const usefulRef = useRef<HTMLDivElement>(null)
    const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    function openUseful() {
        if (hoverCloseTimer.current) clearTimeout(hoverCloseTimer.current)
        const rect = usefulRef.current?.getBoundingClientRect()
        if (rect) {
            setUsefulPos({ top: rect.bottom + 22, left: rect.left + rect.width / 2 })
        }
        setUsefulOpen(true)
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (mobileOpen) setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrolled])

    function handleNavClick(e: React.MouseEvent, link: typeof NAV_LINKS[0]) {
        e.preventDefault()
        if (link.external) {
            window.location.href = link.href
            return
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleMobileNavClick(link: typeof NAV_LINKS[0]) {
        setMobileOpen(false)
        if (link.external) {
            window.location.href = link.href
            return
        }
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 250)
    }

    return (
        <header
            className="fixed left-0 right-0 z-50"
            style={{
                top: 0,
                padding: '8px 8px 0',
                transform: 'translateZ(0)',
                willChange: 'transform',
            }}
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
                        link.external ? (
                            <a
                                key={link.label}
                                href={link.href}
                                className="nav-link"
                            >
                                {link.label}
                            </a>
                        ) : (
                            <button
                                key={link.label}
                                className="nav-link"
                                onClick={e => handleNavClick(e, link)}
                            >
                                {link.label}
                            </button>
                        )
                    ))}

                    {/* Useful links dropdown */}
                    <div
                        ref={usefulRef}
                        style={{ position: 'relative' }}
                        onMouseEnter={openUseful}
                        onMouseLeave={() => {
                            hoverCloseTimer.current = setTimeout(() => setUsefulOpen(false), 150)
                        }}
                    >
                        <button
                            className="nav-link"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}
                            aria-expanded={usefulOpen}
                        >
                            Полезное
                            <motion.span
                                animate={{ rotate: usefulOpen ? 180 : 0 }}
                                transition={{ duration: 0.18 }}
                                style={{ display: 'inline-flex' }}
                            >
                                <ChevronDown size={13} strokeWidth={2} />
                            </motion.span>
                        </button>

                        {mounted && createPortal(
                            <AnimatePresence>
                                {usefulOpen && usefulPos && (
                                    <div
                                        onMouseEnter={openUseful}
                                        onMouseLeave={() => {
                                            hoverCloseTimer.current = setTimeout(() => setUsefulOpen(false), 150)
                                        }}
                                        style={{
                                            position: 'fixed',
                                            top: usefulPos.top,
                                            left: usefulPos.left,
                                            transform: 'translateX(-50%)',
                                            zIndex: 60,
                                        }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                            transition={{ duration: 0.18, ease: 'easeOut' }}
                                            style={{
                                                minWidth: 170,
                                                padding: 6,
                                                borderRadius: 14,
                                                background: 'rgba(255,255,255,0.04)',
                                                backdropFilter: 'blur(40px)',
                                                WebkitBackdropFilter: 'blur(40px)',
                                                border: '1px solid rgba(207,0,163,0.07)',
                                                boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            {USEFUL_LINKS.map(link => (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setUsefulOpen(false)}
                                                    className="nav-link"
                                                    style={{
                                                        display: 'block',
                                                        padding: '8px 12px',
                                                        borderRadius: 8,
                                                        fontSize: '13px',
                                                        whiteSpace: 'nowrap',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {link.label}
                                                </a>
                                            ))}
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>,
                            document.body
                        )}
                    </div>
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
                                <motion.button
                                    key={link.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleMobileNavClick(link)}
                                    className="nav-link"
                                    style={{ fontSize: '15px', color: 'rgba(215,194,240,0.65)', padding: '10px 0', borderBottom: '1px solid rgba(207,0,163,0.06)', textAlign: 'left', width: '100%', borderRadius: 0 }}
                                >
                                    {link.label}
                                </motion.button>
                            ))}

                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: NAV_LINKS.length * 0.05 }}
                                className="font-text"
                                style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(215,194,240,0.3)', margin: '14px 0 4px' }}
                            >
                                Полезное
                            </motion.p>
                            {USEFUL_LINKS.map((link, i) => (
                                <motion.a
                                    key={link.href}
                                    href={link.href}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (NAV_LINKS.length + i) * 0.05 }}
                                    onClick={() => setMobileOpen(false)}
                                    className="nav-link"
                                    style={{ display: 'block', fontSize: '15px', color: 'rgba(215,194,240,0.65)', padding: '10px 0', borderBottom: '1px solid rgba(207,0,163,0.06)', textAlign: 'left', width: '100%', borderRadius: 0 }}
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
