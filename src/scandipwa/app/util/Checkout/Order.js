/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Ivans Zuks <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import BrowserDatabase from 'Util/BrowserDatabase';
import { CART_TOTALS } from 'Store/Cart/Cart.reducer';

export const ORDER = 'order';

export const setCartItemsToOrder = (orderId, customerData = {}) => {
    const totals = BrowserDatabase.getItem(CART_TOTALS);

    BrowserDatabase.setItem({ orderId, totals, customerData }, ORDER);
};

export const getCartItemsFromOrder = (orderId) => {
    const order = BrowserDatabase.getItem(ORDER);

    if (!order || order.orderId !== orderId) {
        return false;
    }

    BrowserDatabase.setItem({}, ORDER);

    return order;
};
