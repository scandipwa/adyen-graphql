/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { Field } from 'Util/Query';
import CheckoutQuery from 'Query/Checkout.query';
import BrowserDatabase from 'Util/BrowserDatabase';
import { GUEST_QUOTE_ID } from 'Store/Cart';

export class AdyenQuery {
    getConfig() {
        return new Field('getAdyenConfig')
            .addField('originKey')
            .addField('mode')
            .addField('locale');
    }

    getPaymentMethods() {
        const guestQuoteId = BrowserDatabase.getItem(GUEST_QUOTE_ID);
        const getAdyenPaymentMethods = new Field('getAdyenPaymentMethods')
            .addField('type')
            .addField('brands')
            .addField(new Field('details')
                .addField('key')
                .addField('type')
                .addField('optional'));

        CheckoutQuery._addGuestCartId(guestQuoteId, getAdyenPaymentMethods);

        return getAdyenPaymentMethods;
    }

    processThreeDS2(payload, orderId) {
        return new Field('adyenThreeDS2Process')
            .addArgument('payload', 'String!', JSON.stringify(payload))
            .addArgument('orderId', 'String!', orderId)
            .addField('threeDS2')
            .addField('type')
            .addField('token');
    }
}

export default new AdyenQuery();
