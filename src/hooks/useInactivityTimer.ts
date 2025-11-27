import { useEffect, useRef } from 'react'

export const useInactivityTimer = (
    onIdle: () => void,
    timeout: number = 300000,
) => {
    const timer = useRef<NodeJS.Timeout | null>(null)

    const resetTimer = () => {
        if (timer.current) {
            clearTimeout(timer.current)
        }
        timer.current = setTimeout(onIdle, timeout)
    }

    useEffect(() => {
        const events = ['touchstart', 'touchmove', 'click', 'scroll', 'keydown']

        events.forEach((event) => {
            window.addEventListener(event, resetTimer)
        })

        resetTimer()

        return () => {
            if (timer.current) {
                clearTimeout(timer.current)
            }
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer)
            })
        }
    }, [onIdle, timeout])

    return resetTimer
}