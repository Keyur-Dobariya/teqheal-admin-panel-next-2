import {
    CopyrightOutlined
} from "@ant-design/icons";
import appString from "../../../utils/appString";

export default function FooterUi() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="w-full border-t border-gray-200 bg-white px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-1 text-gray-900 text-sm">
                <CopyrightOutlined />
                {`${currentYear} ${appString.productNameFull}. All rights reserved.`}
            </div>
            <div className="text-xs md:text-sm">
                Powered by <span className="font-semibold text-blue-800 cursor-pointer">{appString.appNameFull}</span>
            </div>
        </div>
    );
}
