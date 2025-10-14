'use client';

import {Avatar, Button, Card} from "antd";
import {getDarkColor} from "../../../utils/appColor";
import appKeys from "../../../utils/appKeys";
import imagePaths from "../../../utils/imagesPath";
import appString from "../../../utils/appString";
import {getLocalData} from "../../../dataStorage/DataPref";
import SafeAvatar from "../../../components/SafeAvatar";
import React from "react";
import axios from "axios";
import {endpoints} from "../../../api/apiEndpoints";

export default function CardGreeting({loginUserData}) {

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        const scriptLoaded = await loadRazorpay();
        if (!scriptLoaded) {
            alert("Razorpay SDK failed to load. Check your internet connection.");
            return;
        }

        const {data} = await axios.post(endpoints.createOrder, {amount: 500});
        const {order, key} = data;

        const options = {
            key,
            amount: order.amount,
            currency: order.currency,
            order_id: order.id,
            name: "Teqheal Solution",
            description: "Razorpay Test Transaction",
            handler: async function (response) {
                await axios.post(endpoints.verifyPayment, response);
                alert("Payment successful!");
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    return (
        <Card>
            <div className="flex items-center gap-3 p-4">
                <div className="rounded-full p-[1px] shadow-md"
                     style={{border: `1px solid ${getDarkColor(loginUserData?.userName)}`}}>
                    <SafeAvatar
                        userData={loginUserData}
                        size={50}
                    />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1">
                    <div className="flex items-center text-[17px] font-medium gap-2">
                        <div>{appString.hey}, {loginUserData?.userName} ({loginUserData?.role?.roleName})</div>
                        <img src={imagePaths.heyWaveHand} alt="hey" width={22} height={22}/>
                    </div>
                    <div className="text-[13px] text-gray-500 truncate">{appString.motiveLine}</div>
                </div>
                <Button onClick={handlePayment}>
                    Pay Now
                </Button>
            </div>
        </Card>
    );
}