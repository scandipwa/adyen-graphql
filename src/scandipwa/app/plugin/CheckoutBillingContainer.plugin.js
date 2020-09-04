/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { ADYEN_CC } from './CheckoutPayments.plugin';

class CheckoutBillingContainerPlugin {
    _aroundGetPaymentData = (args, callback = () => {}, instance) => {
        const [ asyncData ] = args;
        const { paymentMethod: code } = instance.state;

        if (code === ADYEN_CC) {
            const [{
                cc_type,
                encryptedCardNumber: number,
                encryptedExpiryMonth: expiryMonth,
                encryptedExpiryYear: expiryYear,
                encryptedSecurityCode: cvc,
                holderName,
                storeCc: store_cc,
                javaEnabled: java_enabled,
                colorDepth: screen_color_depth,
                screenWidth: screen_width,
                screenHeight: screen_height,
                timeZoneOffset: timezone_offset,
                language
            }] = asyncData;

            return {
                code,
                additional_data: {
                    cc_type,
                    number,
                    expiryMonth,
                    expiryYear,
                    cvc,
                    holderName,
                    store_cc,
                    java_enabled,
                    screen_color_depth,
                    screen_width,
                    screen_height,
                    timezone_offset,
                    language
                }
            };
        }

        return callback.apply(instance, args);
    }
}

const {
    _aroundGetPaymentData
} = new CheckoutBillingContainerPlugin();

const config = {
    'Component/CheckoutBilling/Container': {
        'member-function': {
            '_getPaymentData':  _aroundGetPaymentData
        }
    }
};

export default config;
