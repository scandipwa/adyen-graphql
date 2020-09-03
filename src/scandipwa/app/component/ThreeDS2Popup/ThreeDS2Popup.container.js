/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { showNotification } from 'Store/Notification';
import { CheckoutDispatcher, updateCheckoutStatus } from '../../store/Checkout';
import ThreeDS2Popup from './ThreeDS2Popup.component';

export const mapStateToProps = state => ({
    threeDS2: state.CheckoutReducer.threeDS2,
    challengeType: state.CheckoutReducer.challengeType,
    challengeToken: state.CheckoutReducer.challengeToken,
    orderId: state.CheckoutReducer.orderId,
    redirectUrl: state.CheckoutReducer.redirectUrl
});

export const mapDispatchToProps = dispatch => ({
    processThreeDS2: payload => CheckoutDispatcher.processThreeDS2(dispatch, payload),
    showErrorNotification: message => dispatch(showNotification('error', message)),
    setLoading: isLoading => dispatch(updateCheckoutStatus({ isLoading }))
});

export const IDENTIFY_SHOPPER = 'IdentifyShopper';
export const CHALLENGE_SHOPPER = 'ChallengeShopper';
export const REDIRECT_SHOPPER = 'RedirectShopper';

export class ThreeDS2PopupContainer extends ExtensiblePureComponent {
    static propTypes = {
        threeDS2: PropTypes.bool.isRequired,
        challengeType: PropTypes.string,
        challengeToken: PropTypes.string,
        redirectUrl: PropTypes.string,
        processThreeDS2: PropTypes.func.isRequired,
        showErrorNotification: PropTypes.func.isRequired,
        setLoading: PropTypes.func.isRequired
    };

    static defaultProps = {
        challengeType: false,
        challengeToken: false,
        redirectUrl: false
    }

    popupRef = createRef();

    state = {
        isLoading: false
    };

    componentDidUpdate(prevProps) {
        const { challengeType: prevChallengeType } = prevProps;
        const { challengeType } = this.props;

        if (challengeType !== prevChallengeType) {
            this.setLoading(false, this.handleThreeDS2);
        }
    }

    containerProps = () => ({
        popupRef: this.popupRef
    });

    setLoading = (isLoading, callback) => {
        const { setLoading } = this.props;

        setLoading(isLoading);
        this.setState({ isLoading }, callback);
    };

    handleThreeDS2 = () => {
        const {
            challengeType,
            challengeToken,
            processThreeDS2,
            showErrorNotification,
            orderId
        } = this.props;
        const { current } = this.popupRef;
        const { adyen } = window;

        if (challengeType === IDENTIFY_SHOPPER) {
            const threeDS2IdentifyComponent = adyen.create('threeDS2DeviceFingerprint', {
                fingerprintToken: challengeToken,
                onComplete: ({ data }) => {
                    this.setLoading(true);
                    threeDS2IdentifyComponent.unmount();
                    processThreeDS2({ ...data, orderId });
                },
                onError: showErrorNotification
            }).mount(current);
        }

        if (challengeType === CHALLENGE_SHOPPER) {
            const threeDS2ChallengeShopper = adyen.create('threeDS2Challenge', {
                challengeToken,
                size: '05',
                onComplete: ({ data }) => {
                    this.setLoading(true);
                    threeDS2ChallengeShopper.unmount();
                    processThreeDS2(data);
                },
                onError: showErrorNotification
            }).mount(current);
        }
    };

    render() {
        const { isLoading } = this.state;
        const { threeDS2, challengeType } = this.props;

        if (challengeType === REDIRECT_SHOPPER) {
            window.location.href = '/adyen/process/redirect/';
        }

        if (!threeDS2 || isLoading) {
            return null;
        }

        return (
            <ThreeDS2Popup
                { ...this.props }
                { ...this.containerProps() }
            />
        );
    }
}

export default connect(
    middleware(mapStateToProps, 'Scandipwa/AdyenGraphQl/Component/ThreeDS2Popup/Container/mapStateToProps'),
    middleware(mapDispatchToProps, 'Scandipwa/AdyenGraphQl/Component/ThreeDS2Popup/Container/mapDispatchToProps')
)(
    middleware(ThreeDS2PopupContainer, 'Scandipwa/AdyenGraphQl/Component/ThreeDS2Popup/Container')
);
