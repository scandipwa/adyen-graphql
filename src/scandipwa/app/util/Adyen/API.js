import BrowserDatabase from 'Util/BrowserDatabase';
import { GUEST_QUOTE_ID } from 'Store/Cart';
import { AUTH_TOKEN } from 'Util/Auth/Token';

export const PAYMENT_METHODS_ENDPOINT = '/rest/V2/retrieve-adyen-payment-methods'
export const MAKE_PAYMENT_ENDPOINT = '/rest/V2/make-adyen-ideal-payment'

export class AdyenAPI {
    _getGuestCartId = () => BrowserDatabase.getItem(GUEST_QUOTE_ID);
    _getAuthToken = () => BrowserDatabase.getItem(AUTH_TOKEN);
    _getHeaders = () => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${ this._getAuthToken() }`
    });

    _parseResponse = (response) => response
        .then(res => res.json())
        .then(res => JSON.parse(res));

    getPaymentMethods() {
        return this._parseResponse(fetch(
            PAYMENT_METHODS_ENDPOINT,
            {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({ guestCartId: this._getGuestCartId() })
            }
        ));
    }

    makePayment(idealState) {
        return this._parseResponse(fetch(
            MAKE_PAYMENT_ENDPOINT,
            {
                method: 'POST',
                headers: this._getHeaders(),
                body: JSON.stringify({
                    idealStateData: idealState.data,
                    guestCartId: this._getGuestCartId()
                })
            }
        ));
    }
}

export default new AdyenAPI();
