/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

/* eslint-disable jsx-a11y/label-has-associated-control */
import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AdyenCard from '../AdyenCard';

export class Adyen extends ExtensiblePureComponent {
    render() {
        return <AdyenCard { ...this.props } />;
    }
}

export default middleware(Adyen, 'Scandipwa/AdyenGraphQl/Component/Adyen/Component');
