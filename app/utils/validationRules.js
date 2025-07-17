import appString from "./appString";
import appKeys from "./appKeys";

const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const mobilePattern = /^[6789]\d{9}$/;
const passwordStartsWithCapital = /^[A-Z]/;
const passwordHasNumber = /\d/;
const passwordHasSpecialChar = /[@$!%*?&]/;

const validationRules = {
    [appKeys.fullName]: [
        { required: true, message: appString.fullNameV1 },
    ],
    [appKeys.emailAddress]: [
        { required: true, message: appString.emailAddressV1 },
        { pattern: emailPattern, message: appString.emailAddressV2 },
    ],
    [appKeys.mobileNumber]: [
        { required: true, message: appString.mobileNumberV1 },
        { pattern: mobilePattern, message: appString.mobileNumberV2 },
    ],
    [appKeys.password]: [
        { required: true, message: appString.passwordV1 },
        { pattern: passwordStartsWithCapital, message: appString.passwordV2 },
        { pattern: passwordHasNumber, message: appString.passwordV3 },
        { pattern: passwordHasSpecialChar, message: appString.passwordV4 },
        { min: 8, message: appString.passwordV5 },
    ],
    [appKeys.confirmPassword]: (getFieldValue) => [
        { required: true, message: appString.confirmPasswordV1 },
        {
            validator: (_, value) => {
                const password = getFieldValue(appKeys.password);
                if (value && value !== password) {
                    return Promise.reject(appString.confirmPasswordV2);
                }
                return Promise.resolve();
            },
        },
    ],
};

export default validationRules;
