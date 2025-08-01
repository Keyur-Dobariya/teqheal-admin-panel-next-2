'use client';

import Image from "next/image";
import imagePaths from "../../utils/imagesPath";
import appString from "../../utils/appString";
import PlanetSystem from "../../components/PlanetSystem";
import {useEffect, useState} from "react";
import {detectPlatform} from "../../utils/utils";

const CoreValueItem = ({ text }) => (
    <div className="flex flex-row flex-1 items-center gap-[10px]">
        <Image src={imagePaths.right_tick} alt="tick" width={20} height={20} />
        <div className="text-white text-sm font-[400]">{text}</div>
    </div>
);

export default function AuthLayout({ children }) {
    const [isElectron, setIsElectron] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const detected = detectPlatform(userAgent);
        setIsElectron(detected.isElectron)
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col xl:flex-row justify-center items-center overflow-hidden">
            <div
                className="w-full bg-(--primary-color) bg-cover bg-center p-5 xl:w-2/5 xl:h-full flex flex-col justify-around items-center"
                style={{ backgroundImage: `url('${imagePaths.auth_design_bg}')` }}
            >
                {isElectron ? <div className="text-center">
                    <Image
                        className="place-self-center w-45 h-11"
                        src={imagePaths.icon_big_white}
                        alt="icon"
                        width={200}
                        height={60}
                    />
                </div> : <div className="text-center">
                    <Image
                        className="mb-2 place-self-center w-10 h-15 xl:w-17 xl:h-25"
                        src={imagePaths.icon_sm_multi}
                        alt="icon"
                        width={70}
                        height={70}
                    />
                    <div className="text-white font-medium text-xl xl:text-2xl mt-3">
                        {appString.authTitle} <span className="text-amber-500">{appString.appName1}</span>{" "}
                        {appString.appName2}
                    </div>
                    <div className="w-[25px] h-[5px] rounded-xl bg-amber-500 place-self-center my-3"/>
                    <div className="text-white text-sm xl:text-base">{appString.authDes}</div>
                </div>}

                <div className="hidden xl:flex justify-center items-center my-3">
                    <PlanetSystem />
                </div>

                <div className="hidden xl:flex w-full flex-col justify-around items-center">
                    <div className="text-white font-medium text-2xl">{appString.authCoreValue}</div>
                    <div className="w-[25px] h-[5px] rounded-xl bg-amber-500 my-3" />
                    <div className="w-full flex flex-col mt-5 gap-2">
                        <div className="flex flex-row gap-3">
                            <CoreValueItem text={appString.coreV1} />
                            <CoreValueItem text={appString.coreV2} />
                        </div>
                        <div className="flex flex-row gap-3">
                            <CoreValueItem text={appString.coreV3} />
                            <CoreValueItem text={appString.coreV4} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto w-full bg-white flex-1 xl:h-full flex justify-center xl:items-center relative">
                {/*<motion.div*/}
                {/*    className="overflow-y-auto w-full bg-white flex-1 xl:h-full flex justify-center xl:items-center relative"*/}
                {/*    initial={{ opacity: 0, x: 50 }}*/}
                {/*    animate={{ opacity: 1, x: 0 }}*/}
                {/*    exit={{ opacity: 0, x: -50 }}*/}
                {/*    transition={{ duration: 0.3 }}*/}
                {/*>*/}
                {children}
                <img
                    className="hidden md:block absolute top-0 left-0 z-0"
                    src={imagePaths.auth_design_dot_square}
                    alt="design"
                />
                <img
                    className="hidden md:block absolute bottom-0 right-0 z-0"
                    src={imagePaths.auth_design_dot_square}
                    alt="design"
                />
                <img
                    className="hidden md:block absolute bottom-0 left-0 -rotate-180 z-0"
                    src={imagePaths.auth_design_round_small}
                    alt="design"
                />
                <img
                    className="hidden md:block absolute bottom-0 left-0 -rotate-180 z-0"
                    src={imagePaths.auth_design_round_big}
                    alt="design"
                />
                <img
                    className="hidden md:block absolute top-0 right-0 z-0"
                    src={imagePaths.auth_design_round_small}
                    alt="design"
                />
                <img
                    className="hidden md:block absolute top-0 right-0 z-0"
                    src={imagePaths.auth_design_round_big}
                    alt="design"
                />
            </div>
        </div>
    );
}