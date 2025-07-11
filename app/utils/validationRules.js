import appString from "./appString";
import appKey from "./appKey";

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const mobilePattern = /^[6789]\d{9}$/;
const passwordStartsWithCapital = /^[A-Z]/;
const passwordHasNumber = /\d/;
const passwordHasSpecialChar = /[@$!%*?&]/;

const validationRules = {
    [appKey.fullName]: [
        { required: true, message: appString.fullNameV1 },
    ],
    [appKey.emailAddress]: [
        { required: true, message: appString.emailAddressV1 },
        { pattern: emailPattern, message: appString.emailAddressV2 },
    ],
    [appKey.mobileNumber]: [
        { required: true, message: appString.mobileNumberV1 },
        { pattern: mobilePattern, message: appString.mobileNumberV2 },
    ],
    [appKey.password]: [
        { required: true, message: appString.passwordV1 },
        { pattern: passwordStartsWithCapital, message: appString.passwordV2 },
        { pattern: passwordHasNumber, message: appString.passwordV3 },
        { pattern: passwordHasSpecialChar, message: appString.passwordV4 },
        { min: 8, message: appString.passwordV5 },
    ],
    [appKey.confirmPassword]: (getFieldValue) => [
        { required: true, message: appString.confirmPasswordV1 },
        {
            validator: (_, value) => {
                const password = getFieldValue(appKey.password);
                if (value && value !== password) {
                    return Promise.reject(appString.confirmPasswordV2);
                }
                return Promise.resolve();
            },
        },
    ],
};

export default validationRules;
