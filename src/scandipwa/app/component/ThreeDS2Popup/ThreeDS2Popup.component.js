/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import './ThreeDS2Popup.style';

export const THREEDS2_POPUP = 'threeds2_popup';

export class ThreeDS2Popup extends ExtensiblePureComponent {
    static propTypes = {
        popupRef: PropTypes.object.isRequired
    };

    render() {
        const { popupRef } = this.props;

        return createPortal((
            <div block="ThreeDS2Popup" elem="Wrapper">
                <div block="ThreeDS2Popup" ref={ popupRef } />
            </div>
        ), document.body);
    }
}

export default middleware(ThreeDS2Popup, 'Scandipwa/AdyenGraphQl/Component/ThreeDS2Popup/Component');
