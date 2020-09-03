/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Ivans Zuks <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import ContentWrapper from 'Component/ContentWrapper';
import ThreeDS2Popup from '../component/ThreeDS2Popup';

class CheckoutPlugin {
    aroundRender = (args, callback = () => {}, instance) => {
        return (
            <main block="Checkout">
                <ThreeDS2Popup />
                <ContentWrapper
                    wrapperMix={ { block: 'Checkout', elem: 'Wrapper' } }
                    label={ __('Checkout page') }
                >
                    <div block="Checkout" elem="Step">
                        { instance.renderTitle() }
                        { instance.renderGuestForm() }
                        { instance.renderStep() }
                        { instance.renderLoader() }
                    </div>
                    <div>
                        { instance.renderSummary() }
                        { instance.renderPromo() }
                    </div>
                </ContentWrapper>
            </main>
        );
    }
}

const {
    aroundRender
} = new CheckoutPlugin();

const config = {
    'Route/Checkout/Component': {
        'member-function': {
            render: [
                {
                    position: 100,
                    implementation: aroundRender
                }
            ]
        }
    }
};

export default config;
