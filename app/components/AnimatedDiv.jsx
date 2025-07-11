'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const DIRECTION = {
    TOP_TO_BOTTOM: "top-to-bottom",
    BOTTOM_TO_TOP: "bottom-to-top",
    LEFT_TO_RIGHT: "left-to-right",
    RIGHT_TO_LEFT: "right-to-left",
};

export const Direction = Object.freeze(DIRECTION);

export default function AnimatedDiv({ children, className, style, direction = Direction.RIGHT_TO_LEFT }) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        setIsInitialLoad(false);
    }, []);

    const animationProps = {
        [Direction.TOP_TO_BOTTOM]: {
            initial: { opacity: 0, y: -50 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: 50 },
        },
        [Direction.BOTTOM_TO_TOP]: {
            initial: { opacity: 0, y: 50 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -50 },
        },
        [Direction.LEFT_TO_RIGHT]: {
            initial: { opacity: 0, x: -50 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 50 },
        },
        [Direction.RIGHT_TO_LEFT]: {
            initial: { opacity: 0, x: 50 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -50 },
        },
    };

    const validDirection = Object.values(Direction).includes(direction)
        ? direction
        : Direction.RIGHT_TO_LEFT;

    const { initial, animate, exit } = animationProps[validDirection];

    return (
        <motion.div
            className={className}
            style={style}
            initial={isInitialLoad ? initial : false}
            animate={isInitialLoad ? animate : { opacity: 1, x: 0, y: 0 }}
            exit={isInitialLoad ? exit : { opacity: 1, x: 0, y: 0 }}
            transition={isInitialLoad ? { duration: 0.3 } : { duration: 0 }}
        >
            {children}
        </motion.div>
    );
}