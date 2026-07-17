'use client'

import { motion } from 'framer-motion'

interface PersonalAccountButtonProps {
    fullWidth?: boolean
}

export default function PersonalAccountButton({ fullWidth = false }: PersonalAccountButtonProps) {
    return (
        <motion.a
            href="https://web.postq.space"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="font-display inline-flex items-center justify-center px-5 py-2 no-underline focus:outline-none"
            style={{
                fontSize: '13px',
                fontWeight: '400',
                letterSpacing: '0.06em',
                borderRadius: '9px',
                textShadow: '0 0 8px rgba(207, 0, 163, 0.6)',
                border: '1.5px solid rgba(207, 0, 163, 0.7)',
                background: 'linear-gradient(135deg, rgba(207, 0, 163, 0.15) 0%, rgba(147, 27, 121, 0.1) 100%)',
                boxShadow: '0 0 15px rgba(207, 0, 163, 0.3), inset 0 0 15px rgba(207, 0, 163, 0.05)',
                color: 'rgb(255, 255, 255)',
                transition: 'color, background-color, border-color, box-shadow, transform, opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                width: fullWidth ? '100%' : undefined,
            }}
        >
            Личный кабинет
        </motion.a>
    )
}
