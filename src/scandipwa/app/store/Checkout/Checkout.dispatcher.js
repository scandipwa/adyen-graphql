/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { fetchMutation } from 'Util/Request';
import AdyenQuery from '../../query/Adyen.query';
import { CartDispatcher } from 'Store/Cart';
import { showNotification } from 'Store/Notification';
import BrowserDatabase from 'Util/BrowserDatabase';

import {
    updateCheckoutState,
    updateCheckoutStatus
} from './Checkout.action';

export const PAYMENT_TOTALS = 'PAYMENT_TOTALS';
export const STRIPE_AUTH_REQUIRED = 'Authentication Required: ';

export class Checkout {
    async processThreeDS2(dispatch, payload) {
        const { orderId = '' } = payload;

        if (!orderId) {
            payload.orderId = BrowserDatabase.getItem('orderId');
        }

        const query = AdyenQuery.processThreeDS2(payload, BrowserDatabase.getItem('orderId'));

        try {
            const {
                adyenThreeDS2Process: {
                    threeDS2,
                    type: challengeType,
                    token: challengeToken
                }
            } = await fetchMutation(query);

            if (!threeDS2) {
                dispatch(updateCheckoutState({ isProcessed: true }));
            }

            const data = {
                threeDS2: threeDS2 || false,
                challengeType: challengeType || '',
                challengeToken: challengeToken || ''
            };

            dispatch(updateCheckoutState(data));
        } catch (e) {
            this._handleError(dispatch, e);

            // On 3D security, after order is placed, Cart data being removed from FE. To donot change full data
            // flow, we just request once mor cart data.
            // This function called 2 times - before 3D popup and after. our Goal - catch 2ond time call, and on error
            // reload cart data.
            CartDispatcher.updateInitialCartData(dispatch);
        }
    }

    _handleError(dispatch, error) {
        const [{ message, debugMessage }] = error;

        dispatch(updateCheckoutStatus({
            isLoading: false,
            isPaymentMethodsLoading: false,
            isDeliveryOptionsLoading: false
        }));
        dispatch(showNotification('error', debugMessage || message));
    }

    updateCheckoutState(dispatch, payload) {
        dispatch(updateCheckoutState(payload));
    }
}

export default new Checkout();
