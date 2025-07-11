'use client';

import {SafetyCertificateFilled, TrophyFilled, DashboardFilled, MessageFilled} from "@ant-design/icons";
import React from "react";
import Image from "next/image";
import imagePaths from "../utils/imagesPath";
import appColor from "../utils/appColor";

export default function PlanetSystem() {
    const orbitRadius = 110;
    const planetSize = 50;

    const iconsColors = {
        0: appColor.secondPrimary,
        1: appColor.success,
        2: appColor.warning,
        3: appColor.danger,
    };

    const iconsList = [
        <SafetyCertificateFilled />,
        <TrophyFilled />,
        <MessageFilled />,
        <DashboardFilled />,
    ];

    const planets = Array.from({ length: iconsList.length }, (_, i) => {
        const angle = (360 / iconsList.length) * i;
        const iconWithRotation = React.cloneElement(iconsList[i], {
            rotate: -angle,
            // style: {
                // borderRadius: "50px",
                // boxShadow: `0 0 5px 1px ${iconsColors[i]}, inset 0 0 5px 1px ${iconsColors[i]}`,
                // backgroundColor: 'transparent',
                // display: 'block',
                // margin: 'auto',
            // },
        });
        return { angle, icon: iconWithRotation };
    });

    return (
        <div className="w-[300px] h-[300px] relative justify-center items-center">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-25 h-25 flex justify-center items-center bg-[--primary-color] border-2 border-gray-400/50 rounded-full">
                    <div className={`absolute rounded-full w-15 h-15 bg-[#3d59a5] blur-lg z-0`}></div>
                    <Image
                        src={imagePaths.icon_sm_multi}
                        alt="App Icon"
                        width={35}
                        height={35}
                        className="relative z-10"
                    />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 w-[280px] h-[280px] border-2 border-gray-400/50 border-dashed rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div
                className="absolute top-1/2 left-1/2 w-0 h-0"
                style={{
                    animation: 'spinAllPlanets 17s linear infinite',
                    transformOrigin: '0 0',
                }}
            >
                {planets.map(({ angle, icon }, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            transformOrigin: '0 0',
                            transform: `rotate(${angle}deg) translateX(${orbitRadius}px)`,
                            left: 0,
                            top: 0,
                        }}
                    >
                        <div
                            className={`rounded-full shadow-md bg-(--primary-color) border-2 border-gray-400/50 border-dashed flex justify-center`}
                            style={{
                                width: planetSize,
                                height: planetSize,
                                animation: 'spinAllPlanets 17s linear infinite reverse',
                                color: iconsColors[i]
                            }}
                        >
                            {icon}
                            {/*<AppleFilled rotate={-(angle)} className="text-25 text-white" style={{color: "white"}} />*/}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                  @keyframes spinAllPlanets {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
        </div>
    );
}